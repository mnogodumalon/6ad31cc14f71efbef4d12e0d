import { useMemo, useState } from 'react';
import { addMonths, format } from 'date-fns';
import { IconAlertTriangle, IconBulb, IconPlus, IconQuestionMark, IconRuler2, IconFolder } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { Regeln } from '@/types/app';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatDate, lookupKey } from '@/lib/formatters';
import { tx, appLabel } from '@/i18n';
import { useClock, gruss, undoToast } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { Button } from '@/components/ui/button';
import { KanbanWidget, type KanbanCard, type KanbanColumn, type KanbanTone } from '@/components/widgets/KanbanWidget';
import { ChartWidget, type ChartRow } from '@/components/widgets/ChartWidget';

function cut(s: string | undefined, n = 70) {
  const v = (s ?? '').trim();
  return v.length > n ? v.slice(0, n - 1) + '…' : v;
}

function toneForGewissheit(k: string | undefined): KanbanTone {
  if (k === 'belegt' || k === 'gesichert') return 'success';
  if (k === 'hypothese') return 'warning';
  return 'default';
}

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const {
    vorgaenge, annahmen, erkenntnisse, entscheidungen, regeln,
    setRegeln, fetchAll,
  } = data;
  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Shared write: confirm a rule review (next review in 6 months), optimistic + Undo.
  const confirmReview = async (r: Regeln) => {
    const before = r.fields.pruefdatum;
    const next = format(addMonths(clock, 6), 'yyyy-MM-dd');
    setRegeln(prev => prev.map(x => x.record_id === r.record_id ? { ...x, fields: { ...x.fields, pruefdatum: next } } : x));
    try {
      await LivingAppsService.updateRegelnEntry(r.record_id, { pruefdatum: next });
      undoToast(tx`„${cut(r.fields.titel, 40)}“ überprüft — nächste Prüfung ${formatDate(next)}`, async () => {
        setRegeln(prev => prev.map(x => x.record_id === r.record_id ? { ...x, fields: { ...x.fields, pruefdatum: before } } : x));
        try {
          await LivingAppsService.updateRegelnEntry(r.record_id, { pruefdatum: before ?? '' });
        } catch { void fetchAll(); }
      });
    } catch {
      void fetchAll();
    }
  };

  const isDue = (r: Regeln) =>
    lookupKey(r.fields.status) === 'freigegeben' && !!r.fields.pruefdatum && r.fields.pruefdatum.slice(0, 10) <= today;

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type !== 'regeln') return undefined;
      const rec = regeln.find(r => r.record_id === top.record.record_id);
      return rec && isDue(rec)
        ? { label: tx('Überprüfung bestätigen'), onClick: () => void confirmReview(rec) }
        : undefined;
    },
  });
  const enrichedRegeln = crud.enriched.regeln;

  const dueRules = useMemo(
    () => regeln.filter(isDue).sort((a, b) => (a.fields.pruefdatum ?? '').localeCompare(b.fields.pruefdatum ?? '')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [regeln, today],
  );
  const draftRules = regeln.filter(r => lookupKey(r.fields.status) === 'entwurf');
  const openAssumptions = useMemo(
    () => annahmen
      .filter(a => lookupKey(a.fields.status) === 'offen')
      .sort((a, b) => (a.fields.pruefdatum ?? '9999').localeCompare(b.fields.pruefdatum ?? '9999')),
    [annahmen],
  );
  const overdueAssumptions = openAssumptions.filter(a => !!a.fields.pruefdatum && a.fields.pruefdatum.slice(0, 10) < today);
  const runningVorgaenge = vorgaenge.filter(v => lookupKey(v.fields.status) === 'in_bearbeitung');
  const visibleAssumptions = onlyOverdue ? overdueAssumptions : openAssumptions;

  const recent = useMemo(() => {
    const items = [
      ...erkenntnisse.map(e => ({
        key: `erkenntnisse:${e.record_id}`,
        when: (e.fields.erfassungsdatum ?? e.createdat ?? '').slice(0, 10),
        title: e.fields.titel ?? '',
        gew: e.fields.gewissheit?.label,
        her: e.fields.herkunft?.label,
        kind: appLabel('erkenntnisse'),
      })),
      ...entscheidungen.map(d => ({
        key: `entscheidungen:${d.record_id}`,
        when: (d.fields.entscheidungsdatum ?? d.createdat ?? '').slice(0, 10),
        title: d.fields.titel ?? '',
        gew: d.fields.gewissheit?.label,
        her: d.fields.herkunft?.label,
        kind: appLabel('entscheidungen'),
      })),
    ];
    return items.sort((a, b) => (b.when ?? '').localeCompare(a.when ?? ''));
  }, [erkenntnisse, entscheidungen]);

  const openRecent = (id: string) => {
    const [type, rid] = id.split(':');
    if (type === 'erkenntnisse') {
      const r = erkenntnisse.find(x => x.record_id === rid);
      if (r) crud.erkenntnisse.openDetail(r);
    } else {
      const r = entscheidungen.find(x => x.record_id === rid);
      if (r) crud.entscheidungen.openDetail(r);
    }
  };

  const columns: KanbanColumn[] = (LOOKUP_OPTIONS['regeln']?.['status'] ?? []).map(o => ({ key: o.key, label: o.label }));
  const cards: KanbanCard[] = regeln.map(r => {
    const st = lookupKey(r.fields.status) ?? columns[0]?.key ?? '';
    const due = isDue(r);
    return {
      id: `regeln:${r.record_id}`,
      column: st,
      title: r.fields.titel ?? tx('Ohne Titel'),
      subtitle: [r.fields.gewissheit?.label, due ? tx('Prüfung fällig') : r.fields.pruefdatum ? tx`Prüfung ${formatDate(r.fields.pruefdatum)}` : null]
        .filter(Boolean).join(' · '),
      tone: due ? 'destructive' : toneForGewissheit(lookupKey(r.fields.gewissheit)),
    };
  });

  const moveCard = async (cardId: string, newColumn: string) => {
    const rid = cardId.split(':')[1];
    const rec = regeln.find(r => r.record_id === rid);
    if (!rec) return;
    if (newColumn === 'freigegeben') {
      return tx('Regeln gibt ausschließlich die freigebende Leitung frei — nicht per Drag & Drop und nie die KI. Öffne die Regel und nutze den Freigabe-Ablauf.');
    }
    const before = lookupKey(rec.fields.status) ?? 'entwurf';
    setRegeln(prev => prev.map(r => r.record_id === rid ? { ...r, fields: { ...r.fields, status: lookupOption('regeln', 'status', newColumn) } } : r));
    try {
      await LivingAppsService.updateRegelnEntry(rid, { status: newColumn });
      undoToast(tx`„${cut(rec.fields.titel, 40)}“ verschoben`, async () => {
        setRegeln(prev => prev.map(r => r.record_id === rid ? { ...r, fields: { ...r.fields, status: lookupOption('regeln', 'status', before) } } : r));
        try { await LivingAppsService.updateRegelnEntry(rid, { status: before }); } catch { void fetchAll(); }
      });
    } catch {
      void fetchAll();
    }
  };

  const chartRows: ChartRow<(typeof erkenntnisse)[number]>[] = erkenntnisse.map(e => ({ id: `erkenntnisse:${e.record_id}`, data: e }));

  // Context line — names things in every branch
  let context: string;
  if (vorgaenge.length === 0 && regeln.length === 0 && erkenntnisse.length === 0) {
    context = tx('Dein Gedächtnis ist noch leer — erfasse den ersten Vorgang.');
  } else if (dueRules.length > 0) {
    context = tx`Die Regel „${cut(dueRules[0].fields.titel, 50)}“ wartet auf ihre Überprüfung.`;
  } else if (openAssumptions.length > 0) {
    context = tx`Als Nächstes zu prüfen: „${cut(openAssumptions[0].fields.aussage, 60)}“.`;
  } else if (runningVorgaenge.length > 0) {
    context = tx`Laufend: „${cut(runningVorgaenge[0].fields.titel, 50)}“ — keine offenen Annahmen.`;
  } else {
    context = tx('Alle Annahmen sind geprüft und alle Regeln aktuell.');
  }

  const empty = vorgaenge.length === 0;

  const hero = empty ? (
    <HeroBanner
      icon={<IconFolder size={48} />}
      action={{ label: tx('Ersten Vorgang erfassen'), onClick: () => crud.vorgaenge.openCreate({ status: 'in_bearbeitung' }) }}
    >
      {tx('Halte fest, was deine Organisation über ihre Arbeit weiß — Anforderungen, Entscheidungen, Annahmen und Regeln.')}
    </HeroBanner>
  ) : dueRules.length > 0 ? (
    <HeroBanner
      icon={<IconAlertTriangle size={18} />}
      action={{ label: tx('Überprüfung bestätigen'), onClick: () => void confirmReview(dueRules[0]) }}
    >
      {dueRules.length === 1
        ? tx`Regel „${cut(dueRules[0].fields.titel, 50)}“ ist zur Überprüfung fällig (seit ${formatDate(dueRules[0].fields.pruefdatum)}).`
        : tx`${dueRules.length} Regeln sind zur Überprüfung fällig, zuerst „${cut(dueRules[0].fields.titel, 50)}“.`}
    </HeroBanner>
  ) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{context}</p>
        </div>
        {crud.vorgaenge.canWrite && (
          <Button onClick={() => crud.vorgaenge.openCreate({ status: 'in_bearbeitung' })}>
            <IconPlus size={16} className="shrink-0" />
            {tx('Neuer Vorgang')}
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        hero={hero}
        kpis={empty ? undefined : (
          <StatStrip>
            <StatStripItem
              title={tx('Offene Annahmen')}
              value={openAssumptions.length}
              icon={<IconQuestionMark size={18} className="text-muted-foreground" />}
              tone={overdueAssumptions.length > 0 ? 'warning' : 'default'}
              onClick={() => setOnlyOverdue(v => !v)}
              active={onlyOverdue}
            />
            <StatStripItem
              title={tx('Regeln im Entwurf')}
              value={draftRules.length}
              icon={<IconRuler2 size={18} className="text-muted-foreground" />}
            />
            <StatStripItem
              title={tx('Laufende Vorgänge')}
              value={runningVorgaenge.length}
              icon={<IconFolder size={18} className="text-muted-foreground" />}
            />
          </StatStrip>
        )}
        primary={
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['ueberholt']}
            onCardClick={card => {
              const rec = regeln.find(r => r.record_id === card.id.split(':')[1]);
              if (rec) crud.regeln.openDetail(rec);
            }}
            onCardMove={crud.regeln.canWrite ? moveCard : undefined}
            onAddCard={crud.regeln.canWrite
              ? column => crud.regeln.openCreate({ status: column === 'freigegeben' ? 'entwurf' : column })
              : undefined}
          />
        }
        aside={
          <>
            <WorkList
              title={onlyOverdue ? tx('Überfällige Annahmen') : tx('Annahmen zu prüfen')}
              icon={<IconQuestionMark size={16} />}
              items={visibleAssumptions.map(a => {
                const overdue = !!a.fields.pruefdatum && a.fields.pruefdatum.slice(0, 10) < today;
                return {
                  id: a.record_id,
                  title: cut(a.fields.aussage) || tx('Ohne Aussage'),
                  secondLine: (
                    <>
                      <span className="font-medium">{a.fields.gewissheit?.label ?? tx('Gewissheit offen')}</span>
                      <span className={overdue ? 'text-destructive' : 'text-muted-foreground'}>
                        {a.fields.pruefdatum ? ` · ${tx('Prüfung')} ${formatDate(a.fields.pruefdatum)}` : ` · ${tx('kein Prüftermin')}`}
                      </span>
                    </>
                  ),
                };
              })}
              onItemClick={id => {
                const rec = annahmen.find(a => a.record_id === id);
                if (rec) crud.annahmen.openDetail(rec);
              }}
              empty={{
                text: tx('Keine offenen Annahmen — alles bestätigt oder widerlegt.'),
                action: crud.annahmen.canWrite ? { label: tx('Annahme erfassen'), onClick: () => crud.annahmen.openCreate({ status: 'offen' }) } : undefined,
              }}
            />
            <WorkList
              title={tx('Zuletzt erfasstes Wissen')}
              icon={<IconBulb size={16} />}
              items={recent.map(r => ({
                id: r.key,
                title: cut(r.title) || tx('Ohne Titel'),
                secondLine: (
                  <span className="text-muted-foreground">
                    {r.kind} · {r.gew ?? tx('ohne Gewissheit')} · {r.her ?? tx('Herkunft offen')}{r.when ? ` · ${formatDate(r.when)}` : ''}
                  </span>
                ),
              }))}
              onItemClick={openRecent}
              empty={{
                text: tx('Noch keine Erkenntnisse oder Entscheidungen erfasst.'),
                action: crud.erkenntnisse.canWrite ? { label: tx('Erkenntnis erfassen'), onClick: () => crud.erkenntnisse.openCreate({}) } : undefined,
              }}
            />
            <ChartWidget
              title={tx('Erkenntnisse nach Gewissheit')}
              rows={chartRows}
              dimension={{ kind: 'category', accessor: r => r.data.fields.gewissheit, label: tx('Gewissheit') }}
              tone={seg => (seg.key === 'hypothese' ? 'warning' : 'default')}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
