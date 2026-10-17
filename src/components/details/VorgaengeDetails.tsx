import type { Vorgaenge, Entscheidungen, Annahmen, Erkenntnisse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface VorgaengeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Vorgaenge;
  /** 1:N „Entscheidungen" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenList: Entscheidungen[];
  /** Zeilen-Klick → overlay.push auf das Entscheidungen-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungen: (record: Entscheidungen) => void;
  /** Kontextuelles „+": öffnet den Entscheidungen-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungen?: () => void;
  /** 1:N „Annahmen" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  annahmenList: Annahmen[];
  /** Zeilen-Klick → overlay.push auf das Annahmen-Detail (nie der Edit-Dialog). */
  onOpenAnnahmen: (record: Annahmen) => void;
  /** Kontextuelles „+": öffnet den Annahmen-Dialog mit diesem Record vorgesetzt. */
  onAddAnnahmen?: () => void;
  /** 1:N „Erkenntnisse" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  erkenntnisseList: Erkenntnisse[];
  /** Zeilen-Klick → overlay.push auf das Erkenntnisse-Detail (nie der Edit-Dialog). */
  onOpenErkenntnisse: (record: Erkenntnisse) => void;
  /** Kontextuelles „+": öffnet den Erkenntnisse-Dialog mit diesem Record vorgesetzt. */
  onAddErkenntnisse?: () => void;
}

export function VorgaengeDetails({
  record,
  entscheidungenList,
  onOpenEntscheidungen,
  onAddEntscheidungen,
  annahmenList,
  onOpenAnnahmen,
  onAddAnnahmen,
  erkenntnisseList,
  onOpenErkenntnisse,
  onAddErkenntnisse,
}: VorgaengeDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('vorgaenge', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'fachgebiet')} value={record.fields.fachgebiet} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('vorgaenge', 'startdatum')} value={record.fields.startdatum} format="date" />
        <RecordField label={fieldLabel('vorgaenge', 'abschlussdatum')} value={record.fields.abschlussdatum} format="date" />
        <RecordField label={fieldLabel('vorgaenge', 'anforderungen')} value={record.fields.anforderungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'randbedingungen')} value={record.fields.randbedingungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'werkzeuge')} value={record.fields.werkzeuge} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'verantwortlich_vorname')} value={record.fields.verantwortlich_vorname} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'verantwortlich_nachname')} value={record.fields.verantwortlich_nachname} format="text" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('entscheidungen')}
        items={entscheidungenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('entscheidungen'), meta: r.fields.entscheidungsdatum })}
        onOpen={onOpenEntscheidungen}
        onAdd={onAddEntscheidungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('annahmen')}
        items={annahmenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.pruefer_vorname ?? appLabel('annahmen'), meta: r.fields.pruefdatum })}
        onOpen={onOpenAnnahmen}
        onAdd={onAddAnnahmen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erkenntnisse')}
        items={erkenntnisseList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erkenntnisse'), meta: r.fields.erfassungsdatum })}
        onOpen={onOpenErkenntnisse}
        onAdd={onAddErkenntnisse}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.VORGAENGE} recordId={record.record_id} readOnly={!perms.canWrite('vorgaenge')} />
    </>
  );
}
