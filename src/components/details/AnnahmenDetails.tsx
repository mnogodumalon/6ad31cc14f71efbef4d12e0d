import type { Annahmen, Vorgaenge, Entscheidungen, Erkenntnisse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface AnnahmenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Annahmen;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „Entscheidungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  entscheidungenList: Entscheidungen[];
  /** Klick auf die Entscheidungen-Relation → overlay.push auf dessen Detail. */
  onOpenEntscheidungen?: (record: Entscheidungen) => void;
  /** 1:N „Erkenntnisse" (annahme): VOLLE Liste — der Block filtert auf diesen Record. */
  erkenntnisseList: Erkenntnisse[];
  /** Zeilen-Klick → overlay.push auf das Erkenntnisse-Detail (nie der Edit-Dialog). */
  onOpenErkenntnisse: (record: Erkenntnisse) => void;
  /** Kontextuelles „+": öffnet den Erkenntnisse-Dialog mit diesem Record vorgesetzt. */
  onAddErkenntnisse?: () => void;
}

export function AnnahmenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  entscheidungenList,
  onOpenEntscheidungen,
  erkenntnisseList,
  onOpenErkenntnisse,
  onAddErkenntnisse,
}: AnnahmenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const entscheidungTarget = entscheidungenList.find(r => r.record_id === extractRecordId(record.fields.entscheidung));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('annahmen', 'aussage')} value={record.fields.aussage} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('annahmen', 'gewissheit')} value={record.fields.gewissheit} format="pill" />
        <RecordField label={fieldLabel('annahmen', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('annahmen', 'pruefdatum')} value={record.fields.pruefdatum} format="date" />
        <RecordField label={fieldLabel('annahmen', 'pruefergebnis')} value={record.fields.pruefergebnis} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('annahmen', 'pruefer_vorname')} value={record.fields.pruefer_vorname} format="text" />
        <RecordField label={fieldLabel('annahmen', 'pruefer_nachname')} value={record.fields.pruefer_nachname} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('annahmen', 'vorgang')}
          name={vorgangTarget?.fields.titel ?? '—'}
          meta={[vorgangTarget?.fields.fachgebiet, vorgangTarget?.fields.werkzeuge].filter(Boolean).join(' · ') || undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('annahmen', 'entscheidung')}
          name={entscheidungTarget?.fields.titel ?? '—'}
          meta={[entscheidungTarget?.fields.entscheider_vorname, entscheidungTarget?.fields.entscheider_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={entscheidungTarget && onOpenEntscheidungen ? () => onOpenEntscheidungen!(entscheidungTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('erkenntnisse')}
        items={erkenntnisseList.filter(r => extractRecordId(r.fields.annahme) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erkenntnisse'), meta: r.fields.erfassungsdatum })}
        onOpen={onOpenErkenntnisse}
        onAdd={onAddErkenntnisse}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ANNAHMEN} recordId={record.record_id} readOnly={!perms.canWrite('annahmen')} />
    </>
  );
}
