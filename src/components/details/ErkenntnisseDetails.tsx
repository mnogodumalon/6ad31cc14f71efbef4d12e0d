import type { Erkenntnisse, Vorgaenge, Entscheidungen, Annahmen, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface ErkenntnisseDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Erkenntnisse;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „Entscheidungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  entscheidungenList: Entscheidungen[];
  /** Klick auf die Entscheidungen-Relation → overlay.push auf dessen Detail. */
  onOpenEntscheidungen?: (record: Entscheidungen) => void;
  /** N:1-Ziel „Annahmen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  annahmenList: Annahmen[];
  /** Klick auf die Annahmen-Relation → overlay.push auf dessen Detail. */
  onOpenAnnahmen?: (record: Annahmen) => void;
  /** 1:N „Regeln" (erkenntnis): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnList: Regeln[];
  /** Zeilen-Klick → overlay.push auf das Regeln-Detail (nie der Edit-Dialog). */
  onOpenRegeln: (record: Regeln) => void;
  /** Kontextuelles „+": öffnet den Regeln-Dialog mit diesem Record vorgesetzt. */
  onAddRegeln?: () => void;
}

export function ErkenntnisseDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  entscheidungenList,
  onOpenEntscheidungen,
  annahmenList,
  onOpenAnnahmen,
  regelnList,
  onOpenRegeln,
  onAddRegeln,
}: ErkenntnisseDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const entscheidungTarget = entscheidungenList.find(r => r.record_id === extractRecordId(record.fields.entscheidung));
  const annahmeTarget = annahmenList.find(r => r.record_id === extractRecordId(record.fields.annahme));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('erkenntnisse', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'erfassungsdatum')} value={record.fields.erfassungsdatum} format="date" />
        <RecordField label={fieldLabel('erkenntnisse', 'geltungsbereich')} value={record.fields.geltungsbereich} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'gewissheit')} value={record.fields.gewissheit} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'herkunft')} value={record.fields.herkunft} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('erkenntnisse', 'vorgang')}
          name={vorgangTarget?.fields.titel ?? '—'}
          meta={[vorgangTarget?.fields.fachgebiet, vorgangTarget?.fields.werkzeuge].filter(Boolean).join(' · ') || undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('erkenntnisse', 'entscheidung')}
          name={entscheidungTarget?.fields.titel ?? '—'}
          meta={[entscheidungTarget?.fields.entscheider_vorname, entscheidungTarget?.fields.entscheider_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={entscheidungTarget && onOpenEntscheidungen ? () => onOpenEntscheidungen!(entscheidungTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('erkenntnisse', 'annahme')}
          name={annahmeTarget?.fields.aussage ?? '—'}
          meta={[annahmeTarget?.fields.pruefer_vorname, annahmeTarget?.fields.pruefer_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={annahmeTarget && onOpenAnnahmen ? () => onOpenAnnahmen!(annahmeTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('regeln')}
        items={regelnList.filter(r => extractRecordId(r.fields.erkenntnis) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('regeln'), meta: r.fields.freigabedatum })}
        onOpen={onOpenRegeln}
        onAdd={onAddRegeln}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ERKENNTNISSE} recordId={record.record_id} readOnly={!perms.canWrite('erkenntnisse')} />
    </>
  );
}
