/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'vorgaenge'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.vorgaenge.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.vorgaenge.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.vorgaenge.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.vorgaenge              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   vorgaenge: titel, beschreibung, fachgebiet, status, startdatum, abschlussdatum, anforderungen, randbedingungen, …  ·  ← entscheidungen (list + contextual +) · ← annahmen (list + contextual +) · ← erkenntnisse (list + contextual +)
 *   entscheidungen: vorgang, titel, entscheidungsdatum, fragestellung, loesungsweg, alternativen, begruendung, entscheider_vorname, …  ·  → vorgaenge · ← annahmen (list + contextual +) · ← erkenntnisse (list + contextual +) · ← regeln (list + contextual +)
 *   annahmen: vorgang, entscheidung, aussage, gewissheit, status, pruefdatum, pruefergebnis, pruefer_vorname, …  ·  → vorgaenge · → entscheidungen · ← erkenntnisse (list + contextual +)
 *   erkenntnisse: vorgang, entscheidung, annahme, art, titel, beschreibung, erfassungsdatum, geltungsbereich, …  ·  → vorgaenge · → entscheidungen · → annahmen · ← regeln (list + contextual +)
 *   regeln: titel, regeltext, geltungsbereich, erkenntnis, entscheidung, gewissheit, status, freigabe_vorname, …  ·  → erkenntnisse · → entscheidungen
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Vorgaenge, Entscheidungen, Annahmen, Erkenntnisse, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichEntscheidungen, enrichAnnahmen, enrichErkenntnisse, enrichRegeln } from '@/lib/enrich';
import type { EnrichedEntscheidungen, EnrichedAnnahmen, EnrichedErkenntnisse, EnrichedRegeln } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { VorgaengeDialog, type VorgaengeDialogDefaults } from '@/components/dialogs/VorgaengeDialog';
import { VorgaengeDetails } from '@/components/details/VorgaengeDetails';
import { EntscheidungenDialog, type EntscheidungenDialogDefaults } from '@/components/dialogs/EntscheidungenDialog';
import { EntscheidungenDetails } from '@/components/details/EntscheidungenDetails';
import { AnnahmenDialog, type AnnahmenDialogDefaults } from '@/components/dialogs/AnnahmenDialog';
import { AnnahmenDetails } from '@/components/details/AnnahmenDetails';
import { ErkenntnisseDialog, type ErkenntnisseDialogDefaults } from '@/components/dialogs/ErkenntnisseDialog';
import { ErkenntnisseDetails } from '@/components/details/ErkenntnisseDetails';
import { RegelnDialog, type RegelnDialogDefaults } from '@/components/dialogs/RegelnDialog';
import { RegelnDetails } from '@/components/details/RegelnDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'vorgaenge'; record: Vorgaenge }
  | { type: 'entscheidungen'; record: EnrichedEntscheidungen }
  | { type: 'annahmen'; record: EnrichedAnnahmen }
  | { type: 'erkenntnisse'; record: EnrichedErkenntnisse }
  | { type: 'regeln'; record: EnrichedRegeln };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  vorgaenge: EntityCrudApi<Vorgaenge, VorgaengeDialogDefaults>;
  entscheidungen: EntityCrudApi<Entscheidungen, EntscheidungenDialogDefaults>;
  annahmen: EntityCrudApi<Annahmen, AnnahmenDialogDefaults>;
  erkenntnisse: EntityCrudApi<Erkenntnisse, ErkenntnisseDialogDefaults>;
  regeln: EntityCrudApi<Regeln, RegelnDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { vorgaenge: Vorgaenge[]; entscheidungen: EnrichedEntscheidungen[]; annahmen: EnrichedAnnahmen[]; erkenntnisse: EnrichedErkenntnisse[]; regeln: EnrichedRegeln[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [vorgaengeDialog, setVorgaengeDialog] = useState<{ defaults?: VorgaengeDialogDefaults; editing?: Vorgaenge } | null>(null);
  const [entscheidungenDialog, setEntscheidungenDialog] = useState<{ defaults?: EntscheidungenDialogDefaults; editing?: Entscheidungen } | null>(null);
  const [annahmenDialog, setAnnahmenDialog] = useState<{ defaults?: AnnahmenDialogDefaults; editing?: Annahmen } | null>(null);
  const [erkenntnisseDialog, setErkenntnisseDialog] = useState<{ defaults?: ErkenntnisseDialogDefaults; editing?: Erkenntnisse } | null>(null);
  const [regelnDialog, setRegelnDialog] = useState<{ defaults?: RegelnDialogDefaults; editing?: Regeln } | null>(null);
  const enrichedEntscheidungen = useMemo(() => enrichEntscheidungen(data.entscheidungen, { vorgaengeMap: data.vorgaengeMap }), [data.entscheidungen, data.vorgaengeMap]);
  const enrichedAnnahmen = useMemo(() => enrichAnnahmen(data.annahmen, { vorgaengeMap: data.vorgaengeMap, entscheidungenMap: data.entscheidungenMap }), [data.annahmen, data.vorgaengeMap, data.entscheidungenMap]);
  const enrichedErkenntnisse = useMemo(() => enrichErkenntnisse(data.erkenntnisse, { vorgaengeMap: data.vorgaengeMap, entscheidungenMap: data.entscheidungenMap, annahmenMap: data.annahmenMap }), [data.erkenntnisse, data.vorgaengeMap, data.entscheidungenMap, data.annahmenMap]);
  const enrichedRegeln = useMemo(() => enrichRegeln(data.regeln, { erkenntnisseMap: data.erkenntnisseMap, entscheidungenMap: data.entscheidungenMap }), [data.regeln, data.erkenntnisseMap, data.entscheidungenMap]);

  function detailVorgaenge(record: Vorgaenge, push = false) {
    const item: OverlayItem = { type: 'vorgaenge', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitVorgaenge(fields: Vorgaenge['fields']) {
    const editing = vorgaengeDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setVorgaenge(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateVorgaengeEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('vorgaenge')} — ${t('crud_updated')}`, async () => {
        data.setVorgaenge(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateVorgaengeEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createVorgaengeEntry(fields);
      undoToast(`${appLabel('vorgaenge')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailEntscheidungen(record: Entscheidungen, push = false) {
    const rec = enrichedEntscheidungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'entscheidungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitEntscheidungen(fields: Entscheidungen['fields']) {
    const editing = entscheidungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setEntscheidungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateEntscheidungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('entscheidungen')} — ${t('crud_updated')}`, async () => {
        data.setEntscheidungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateEntscheidungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createEntscheidungenEntry(fields);
      undoToast(`${appLabel('entscheidungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAnnahmen(record: Annahmen, push = false) {
    const rec = enrichedAnnahmen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'annahmen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAnnahmen(fields: Annahmen['fields']) {
    const editing = annahmenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAnnahmen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAnnahmenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('annahmen')} — ${t('crud_updated')}`, async () => {
        data.setAnnahmen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAnnahmenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAnnahmenEntry(fields);
      undoToast(`${appLabel('annahmen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailErkenntnisse(record: Erkenntnisse, push = false) {
    const rec = enrichedErkenntnisse.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'erkenntnisse', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErkenntnisse(fields: Erkenntnisse['fields']) {
    const editing = erkenntnisseDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErkenntnisse(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErkenntnisseEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('erkenntnisse')} — ${t('crud_updated')}`, async () => {
        data.setErkenntnisse(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErkenntnisseEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createErkenntnisseEntry(fields);
      undoToast(`${appLabel('erkenntnisse')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRegeln(record: Regeln, push = false) {
    const rec = enrichedRegeln.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'regeln', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRegeln(fields: Regeln['fields']) {
    const editing = regelnDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRegeln(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRegelnEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('regeln')} — ${t('crud_updated')}`, async () => {
        data.setRegeln(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRegelnEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRegelnEntry(fields);
      undoToast(`${appLabel('regeln')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <VorgaengeDialog
        open={vorgaengeDialog !== null}
        onClose={() => setVorgaengeDialog(null)}
        onSubmit={submitVorgaenge}
        defaultValues={vorgaengeDialog?.defaults}
        recordId={vorgaengeDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Vorgaenge']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Vorgaenge']}
      />
      <EntscheidungenDialog
        open={entscheidungenDialog !== null}
        onClose={() => setEntscheidungenDialog(null)}
        onSubmit={submitEntscheidungen}
        defaultValues={entscheidungenDialog?.defaults}
        recordId={entscheidungenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        enablePhotoScan={AI_PHOTO_SCAN['Entscheidungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Entscheidungen']}
      />
      <AnnahmenDialog
        open={annahmenDialog !== null}
        onClose={() => setAnnahmenDialog(null)}
        onSubmit={submitAnnahmen}
        defaultValues={annahmenDialog?.defaults}
        recordId={annahmenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        entscheidungenList={data.entscheidungen}
        enablePhotoScan={AI_PHOTO_SCAN['Annahmen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Annahmen']}
      />
      <ErkenntnisseDialog
        open={erkenntnisseDialog !== null}
        onClose={() => setErkenntnisseDialog(null)}
        onSubmit={submitErkenntnisse}
        defaultValues={erkenntnisseDialog?.defaults}
        recordId={erkenntnisseDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        entscheidungenList={data.entscheidungen}
        annahmenList={data.annahmen}
        enablePhotoScan={AI_PHOTO_SCAN['Erkenntnisse']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Erkenntnisse']}
      />
      <RegelnDialog
        open={regelnDialog !== null}
        onClose={() => setRegelnDialog(null)}
        onSubmit={submitRegeln}
        defaultValues={regelnDialog?.defaults}
        recordId={regelnDialog?.editing?.record_id}
        erkenntnisseList={data.erkenntnisse}
        entscheidungenList={data.entscheidungen}
        enablePhotoScan={AI_PHOTO_SCAN['Regeln']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Regeln']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'vorgaenge') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('vorgaenge')} subtitle={top.record.fields.startdatum ? formatDate(top.record.fields.startdatum) : undefined} />
                <VorgaengeDetails
                  record={top.record}
                  entscheidungenList={data.entscheidungen}
                  onOpenEntscheidungen={(r) => detailEntscheidungen(r, true)}
                  onAddEntscheidungen={perms.canWrite('entscheidungen') ? () => setEntscheidungenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  annahmenList={data.annahmen}
                  onOpenAnnahmen={(r) => detailAnnahmen(r, true)}
                  onAddAnnahmen={perms.canWrite('annahmen') ? () => setAnnahmenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  onAddErkenntnisse={perms.canWrite('erkenntnisse') ? () => setErkenntnisseDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'entscheidungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('entscheidungen')} subtitle={top.record.fields.entscheidungsdatum ? formatDate(top.record.fields.entscheidungsdatum) : undefined} />
                <EntscheidungenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  annahmenList={data.annahmen}
                  onOpenAnnahmen={(r) => detailAnnahmen(r, true)}
                  onAddAnnahmen={perms.canWrite('annahmen') ? () => setAnnahmenDialog({ defaults: { entscheidung: createRecordUrl(APP_IDS.ENTSCHEIDUNGEN, top.record.record_id) } }) : undefined}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  onAddErkenntnisse={perms.canWrite('erkenntnisse') ? () => setErkenntnisseDialog({ defaults: { entscheidung: createRecordUrl(APP_IDS.ENTSCHEIDUNGEN, top.record.record_id) } }) : undefined}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  onAddRegeln={perms.canWrite('regeln') ? () => setRegelnDialog({ defaults: { entscheidung: createRecordUrl(APP_IDS.ENTSCHEIDUNGEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'annahmen') {
            return (
              <>
                <RecordHeader title={top.record.fields.pruefer_vorname ?? appLabel('annahmen')} subtitle={top.record.fields.pruefdatum ? formatDate(top.record.fields.pruefdatum) : undefined} />
                <AnnahmenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  entscheidungenList={data.entscheidungen}
                  onOpenEntscheidungen={(r) => detailEntscheidungen(r, true)}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  onAddErkenntnisse={perms.canWrite('erkenntnisse') ? () => setErkenntnisseDialog({ defaults: { annahme: createRecordUrl(APP_IDS.ANNAHMEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'erkenntnisse') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('erkenntnisse')} subtitle={top.record.fields.erfassungsdatum ? formatDate(top.record.fields.erfassungsdatum) : undefined} />
                <ErkenntnisseDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  entscheidungenList={data.entscheidungen}
                  onOpenEntscheidungen={(r) => detailEntscheidungen(r, true)}
                  annahmenList={data.annahmen}
                  onOpenAnnahmen={(r) => detailAnnahmen(r, true)}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  onAddRegeln={perms.canWrite('regeln') ? () => setRegelnDialog({ defaults: { erkenntnis: createRecordUrl(APP_IDS.ERKENNTNISSE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'regeln') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('regeln')} subtitle={top.record.fields.freigabedatum ? formatDate(top.record.fields.freigabedatum) : undefined} />
                <RegelnDetails
                  record={top.record}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  entscheidungenList={data.entscheidungen}
                  onOpenEntscheidungen={(r) => detailEntscheidungen(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'vorgaenge') return perms.canWrite('vorgaenge');
          if (top.type === 'entscheidungen') return perms.canWrite('entscheidungen');
          if (top.type === 'annahmen') return perms.canWrite('annahmen');
          if (top.type === 'erkenntnisse') return perms.canWrite('erkenntnisse');
          if (top.type === 'regeln') return perms.canWrite('regeln');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'vorgaenge') setVorgaengeDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'entscheidungen') setEntscheidungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'annahmen') setAnnahmenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'erkenntnisse') setErkenntnisseDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'regeln') setRegelnDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    vorgaenge: {
      openCreate: (defaults?: VorgaengeDialogDefaults) => (perms.canWrite('vorgaenge') ? setVorgaengeDialog({ defaults }) : refuse()),
      openEdit: (record: Vorgaenge) => (perms.canWrite('vorgaenge') ? setVorgaengeDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Vorgaenge) => detailVorgaenge(record, false),
      canWrite: perms.canWrite('vorgaenge'),
    },
    entscheidungen: {
      openCreate: (defaults?: EntscheidungenDialogDefaults) => (perms.canWrite('entscheidungen') ? setEntscheidungenDialog({ defaults }) : refuse()),
      openEdit: (record: Entscheidungen) => (perms.canWrite('entscheidungen') ? setEntscheidungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Entscheidungen) => detailEntscheidungen(record, false),
      canWrite: perms.canWrite('entscheidungen'),
    },
    annahmen: {
      openCreate: (defaults?: AnnahmenDialogDefaults) => (perms.canWrite('annahmen') ? setAnnahmenDialog({ defaults }) : refuse()),
      openEdit: (record: Annahmen) => (perms.canWrite('annahmen') ? setAnnahmenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Annahmen) => detailAnnahmen(record, false),
      canWrite: perms.canWrite('annahmen'),
    },
    erkenntnisse: {
      openCreate: (defaults?: ErkenntnisseDialogDefaults) => (perms.canWrite('erkenntnisse') ? setErkenntnisseDialog({ defaults }) : refuse()),
      openEdit: (record: Erkenntnisse) => (perms.canWrite('erkenntnisse') ? setErkenntnisseDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Erkenntnisse) => detailErkenntnisse(record, false),
      canWrite: perms.canWrite('erkenntnisse'),
    },
    regeln: {
      openCreate: (defaults?: RegelnDialogDefaults) => (perms.canWrite('regeln') ? setRegelnDialog({ defaults }) : refuse()),
      openEdit: (record: Regeln) => (perms.canWrite('regeln') ? setRegelnDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Regeln) => detailRegeln(record, false),
      canWrite: perms.canWrite('regeln'),
    },
    enriched: { vorgaenge: data.vorgaenge, entscheidungen: enrichedEntscheidungen, annahmen: enrichedAnnahmen, erkenntnisse: enrichedErkenntnisse, regeln: enrichedRegeln },
  };
}
