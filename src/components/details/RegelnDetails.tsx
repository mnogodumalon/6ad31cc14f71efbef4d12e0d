import type { Regeln, Erkenntnisse, Entscheidungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface RegelnDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Regeln;
  /** N:1-Ziel „Erkenntnisse": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  erkenntnisseList: Erkenntnisse[];
  /** Klick auf die Erkenntnisse-Relation → overlay.push auf dessen Detail. */
  onOpenErkenntnisse?: (record: Erkenntnisse) => void;
  /** N:1-Ziel „Entscheidungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  entscheidungenList: Entscheidungen[];
  /** Klick auf die Entscheidungen-Relation → overlay.push auf dessen Detail. */
  onOpenEntscheidungen?: (record: Entscheidungen) => void;
}

export function RegelnDetails({
  record,
  erkenntnisseList,
  onOpenErkenntnisse,
  entscheidungenList,
  onOpenEntscheidungen,
}: RegelnDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const erkenntnisTarget = erkenntnisseList.find(r => r.record_id === extractRecordId(record.fields.erkenntnis));
  const entscheidungTarget = entscheidungenList.find(r => r.record_id === extractRecordId(record.fields.entscheidung));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('regeln', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('regeln', 'regeltext')} value={record.fields.regeltext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'geltungsbereich')} value={record.fields.geltungsbereich} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'gewissheit')} value={record.fields.gewissheit} format="pill" />
        <RecordField label={fieldLabel('regeln', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('regeln', 'freigabe_vorname')} value={record.fields.freigabe_vorname} format="text" />
        <RecordField label={fieldLabel('regeln', 'freigabe_nachname')} value={record.fields.freigabe_nachname} format="text" />
        <RecordField label={fieldLabel('regeln', 'freigabedatum')} value={record.fields.freigabedatum} format="date" />
        <RecordField label={fieldLabel('regeln', 'pruefdatum')} value={record.fields.pruefdatum} format="date" />
        <RecordField label={fieldLabel('regeln', 'ki_hinweise')} value={record.fields.ki_hinweise} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('regeln', 'erkenntnis')}
          name={erkenntnisTarget?.fields.titel ?? '—'}
          meta={undefined}
          onClick={erkenntnisTarget && onOpenErkenntnisse ? () => onOpenErkenntnisse!(erkenntnisTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('regeln', 'entscheidung')}
          name={entscheidungTarget?.fields.titel ?? '—'}
          meta={[entscheidungTarget?.fields.entscheider_vorname, entscheidungTarget?.fields.entscheider_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={entscheidungTarget && onOpenEntscheidungen ? () => onOpenEntscheidungen!(entscheidungTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.REGELN} recordId={record.record_id} readOnly={!perms.canWrite('regeln')} />
    </>
  );
}
