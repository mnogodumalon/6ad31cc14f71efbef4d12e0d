import type { Entscheidungen, Vorgaenge, Annahmen, Erkenntnisse, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface EntscheidungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Entscheidungen;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** 1:N „Annahmen" (entscheidung): VOLLE Liste — der Block filtert auf diesen Record. */
  annahmenList: Annahmen[];
  /** Zeilen-Klick → overlay.push auf das Annahmen-Detail (nie der Edit-Dialog). */
  onOpenAnnahmen: (record: Annahmen) => void;
  /** Kontextuelles „+": öffnet den Annahmen-Dialog mit diesem Record vorgesetzt. */
  onAddAnnahmen?: () => void;
  /** 1:N „Erkenntnisse" (entscheidung): VOLLE Liste — der Block filtert auf diesen Record. */
  erkenntnisseList: Erkenntnisse[];
  /** Zeilen-Klick → overlay.push auf das Erkenntnisse-Detail (nie der Edit-Dialog). */
  onOpenErkenntnisse: (record: Erkenntnisse) => void;
  /** Kontextuelles „+": öffnet den Erkenntnisse-Dialog mit diesem Record vorgesetzt. */
  onAddErkenntnisse?: () => void;
  /** 1:N „Regeln" (entscheidung): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnList: Regeln[];
  /** Zeilen-Klick → overlay.push auf das Regeln-Detail (nie der Edit-Dialog). */
  onOpenRegeln: (record: Regeln) => void;
  /** Kontextuelles „+": öffnet den Regeln-Dialog mit diesem Record vorgesetzt. */
  onAddRegeln?: () => void;
}

export function EntscheidungenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  annahmenList,
  onOpenAnnahmen,
  onAddAnnahmen,
  erkenntnisseList,
  onOpenErkenntnisse,
  onAddErkenntnisse,
  regelnList,
  onOpenRegeln,
  onAddRegeln,
}: EntscheidungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('entscheidungen', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('entscheidungen', 'entscheidungsdatum')} value={record.fields.entscheidungsdatum} format="date" />
        <RecordField label={fieldLabel('entscheidungen', 'fragestellung')} value={record.fields.fragestellung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen', 'loesungsweg')} value={record.fields.loesungsweg} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen', 'alternativen')} value={record.fields.alternativen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen', 'begruendung')} value={record.fields.begruendung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen', 'entscheider_vorname')} value={record.fields.entscheider_vorname} format="text" />
        <RecordField label={fieldLabel('entscheidungen', 'entscheider_nachname')} value={record.fields.entscheider_nachname} format="text" />
        <RecordField label={fieldLabel('entscheidungen', 'herkunft')} value={record.fields.herkunft} format="pill" />
        <RecordField label={fieldLabel('entscheidungen', 'gewissheit')} value={record.fields.gewissheit} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('entscheidungen', 'vorgang')}
          name={vorgangTarget?.fields.titel ?? '—'}
          meta={[vorgangTarget?.fields.fachgebiet, vorgangTarget?.fields.werkzeuge].filter(Boolean).join(' · ') || undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('annahmen')}
        items={annahmenList.filter(r => extractRecordId(r.fields.entscheidung) === record.record_id)}
        map={r => ({ name: r.fields.pruefer_vorname ?? appLabel('annahmen'), meta: r.fields.pruefdatum })}
        onOpen={onOpenAnnahmen}
        onAdd={onAddAnnahmen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erkenntnisse')}
        items={erkenntnisseList.filter(r => extractRecordId(r.fields.entscheidung) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erkenntnisse'), meta: r.fields.erfassungsdatum })}
        onOpen={onOpenErkenntnisse}
        onAdd={onAddErkenntnisse}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('regeln')}
        items={regelnList.filter(r => extractRecordId(r.fields.entscheidung) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('regeln'), meta: r.fields.freigabedatum })}
        onOpen={onOpenRegeln}
        onAdd={onAddRegeln}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ENTSCHEIDUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('entscheidungen')} />
    </>
  );
}
