import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Vorgaenge {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    fachgebiet?: string;
    status?: LookupValue;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    abschlussdatum?: string; // Format: YYYY-MM-DD oder ISO String
    anforderungen?: string;
    randbedingungen?: string;
    werkzeuge?: string;
    verantwortlich_vorname?: string;
    verantwortlich_nachname?: string;
  };
}

export interface Entscheidungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorgang?: RecordUrl; // applookup -> URL zu 'Vorgaenge' Record
    titel?: string;
    entscheidungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    fragestellung?: string;
    loesungsweg?: string;
    alternativen?: string;
    begruendung?: string;
    entscheider_vorname?: string;
    entscheider_nachname?: string;
    herkunft?: LookupValue;
    gewissheit?: LookupValue;
  };
}

export interface Annahmen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorgang?: RecordUrl; // applookup -> URL zu 'Vorgaenge' Record
    entscheidung?: RecordUrl; // applookup -> URL zu 'Entscheidungen' Record
    aussage?: string;
    gewissheit?: LookupValue;
    status?: LookupValue;
    pruefdatum?: string; // Format: YYYY-MM-DD oder ISO String
    pruefergebnis?: string;
    pruefer_vorname?: string;
    pruefer_nachname?: string;
  };
}

export interface Erkenntnisse {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorgang?: RecordUrl; // applookup -> URL zu 'Vorgaenge' Record
    entscheidung?: RecordUrl; // applookup -> URL zu 'Entscheidungen' Record
    annahme?: RecordUrl; // applookup -> URL zu 'Annahmen' Record
    art?: LookupValue;
    titel?: string;
    beschreibung?: string;
    erfassungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    geltungsbereich?: string;
    gewissheit?: LookupValue;
    herkunft?: LookupValue;
  };
}

export interface Regeln {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    regeltext?: string;
    geltungsbereich?: string;
    erkenntnis?: RecordUrl; // applookup -> URL zu 'Erkenntnisse' Record
    entscheidung?: RecordUrl; // applookup -> URL zu 'Entscheidungen' Record
    gewissheit?: LookupValue;
    status?: LookupValue;
    freigabe_vorname?: string;
    freigabe_nachname?: string;
    freigabedatum?: string; // Format: YYYY-MM-DD oder ISO String
    pruefdatum?: string; // Format: YYYY-MM-DD oder ISO String
    ki_hinweise?: string;
  };
}

export const APP_IDS = {
  VORGAENGE: '6ad31ca255a4def38e1cbd19',
  ENTSCHEIDUNGEN: '6ad31ca6ced3f4024ebaa047',
  ANNAHMEN: '6ad31ca71f21d41ca90368b0',
  ERKENNTNISSE: '6ad31ca811aa8ca038106872',
  REGELN: '6ad31ca83405d7a782f8b809',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'vorgaenge': {
    status: [{ key: "in_bearbeitung", get label() { return lookupLabel('vorgaenge', 'status', "in_bearbeitung") ?? "In Bearbeitung"; } }, { key: "abgeschlossen", get label() { return lookupLabel('vorgaenge', 'status', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "abgebrochen", get label() { return lookupLabel('vorgaenge', 'status', "abgebrochen") ?? "Abgebrochen"; } }, { key: "geplant", get label() { return lookupLabel('vorgaenge', 'status', "geplant") ?? "Geplant"; } }],
  },
  'entscheidungen': {
    herkunft: [{ key: "mensch", get label() { return lookupLabel('entscheidungen', 'herkunft', "mensch") ?? "Mensch"; } }, { key: "ki_gestuetzt", get label() { return lookupLabel('entscheidungen', 'herkunft', "ki_gestuetzt") ?? "KI-gestützt"; } }, { key: "gemeinsam", get label() { return lookupLabel('entscheidungen', 'herkunft', "gemeinsam") ?? "Gemeinsam"; } }],
    gewissheit: [{ key: "hypothese", get label() { return lookupLabel('entscheidungen', 'gewissheit', "hypothese") ?? "Hypothese"; } }, { key: "plausibel", get label() { return lookupLabel('entscheidungen', 'gewissheit', "plausibel") ?? "Plausibel"; } }, { key: "gesichert", get label() { return lookupLabel('entscheidungen', 'gewissheit', "gesichert") ?? "Gesichert"; } }, { key: "belegt", get label() { return lookupLabel('entscheidungen', 'gewissheit', "belegt") ?? "Belegt durch Messung"; } }],
  },
  'annahmen': {
    gewissheit: [{ key: "hypothese", get label() { return lookupLabel('annahmen', 'gewissheit', "hypothese") ?? "Hypothese"; } }, { key: "plausibel", get label() { return lookupLabel('annahmen', 'gewissheit', "plausibel") ?? "Plausibel"; } }, { key: "gesichert", get label() { return lookupLabel('annahmen', 'gewissheit', "gesichert") ?? "Gesichert"; } }],
    status: [{ key: "offen", get label() { return lookupLabel('annahmen', 'status', "offen") ?? "Offen"; } }, { key: "bestaetigt", get label() { return lookupLabel('annahmen', 'status', "bestaetigt") ?? "Bestätigt"; } }, { key: "widerlegt", get label() { return lookupLabel('annahmen', 'status', "widerlegt") ?? "Widerlegt"; } }],
  },
  'erkenntnisse': {
    art: [{ key: "ergebnis", get label() { return lookupLabel('erkenntnisse', 'art', "ergebnis") ?? "Beobachtetes Ergebnis"; } }, { key: "grenze", get label() { return lookupLabel('erkenntnisse', 'art', "grenze") ?? "Erkannte Grenze"; } }, { key: "lerneffekt", get label() { return lookupLabel('erkenntnisse', 'art', "lerneffekt") ?? "Lerneffekt"; } }, { key: "abweichung", get label() { return lookupLabel('erkenntnisse', 'art', "abweichung") ?? "Abweichung"; } }],
    gewissheit: [{ key: "hypothese", get label() { return lookupLabel('erkenntnisse', 'gewissheit', "hypothese") ?? "Hypothese"; } }, { key: "plausibel", get label() { return lookupLabel('erkenntnisse', 'gewissheit', "plausibel") ?? "Plausibel"; } }, { key: "gesichert", get label() { return lookupLabel('erkenntnisse', 'gewissheit', "gesichert") ?? "Gesichert"; } }, { key: "belegt", get label() { return lookupLabel('erkenntnisse', 'gewissheit', "belegt") ?? "Belegt durch Messung"; } }],
    herkunft: [{ key: "mensch", get label() { return lookupLabel('erkenntnisse', 'herkunft', "mensch") ?? "Mensch"; } }, { key: "ki_gestuetzt", get label() { return lookupLabel('erkenntnisse', 'herkunft', "ki_gestuetzt") ?? "KI-gestützt"; } }, { key: "messung", get label() { return lookupLabel('erkenntnisse', 'herkunft', "messung") ?? "Messung"; } }],
  },
  'regeln': {
    gewissheit: [{ key: "hypothese", get label() { return lookupLabel('regeln', 'gewissheit', "hypothese") ?? "Hypothese"; } }, { key: "plausibel", get label() { return lookupLabel('regeln', 'gewissheit', "plausibel") ?? "Plausibel"; } }, { key: "gesichert", get label() { return lookupLabel('regeln', 'gewissheit', "gesichert") ?? "Gesichert"; } }, { key: "belegt", get label() { return lookupLabel('regeln', 'gewissheit', "belegt") ?? "Belegt durch Messung"; } }],
    status: [{ key: "entwurf", get label() { return lookupLabel('regeln', 'status', "entwurf") ?? "Entwurf"; } }, { key: "freigegeben", get label() { return lookupLabel('regeln', 'status', "freigegeben") ?? "Freigegeben"; } }, { key: "ueberholt", get label() { return lookupLabel('regeln', 'status', "ueberholt") ?? "Überholt"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'vorgaenge': {
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'fachgebiet': 'string/text',
    'status': 'lookup/radio',
    'startdatum': 'date/date',
    'abschlussdatum': 'date/date',
    'anforderungen': 'string/textarea',
    'randbedingungen': 'string/textarea',
    'werkzeuge': 'string/text',
    'verantwortlich_vorname': 'string/text',
    'verantwortlich_nachname': 'string/text',
  },
  'entscheidungen': {
    'vorgang': 'applookup/select',
    'titel': 'string/text',
    'entscheidungsdatum': 'date/date',
    'fragestellung': 'string/textarea',
    'loesungsweg': 'string/textarea',
    'alternativen': 'string/textarea',
    'begruendung': 'string/textarea',
    'entscheider_vorname': 'string/text',
    'entscheider_nachname': 'string/text',
    'herkunft': 'lookup/radio',
    'gewissheit': 'lookup/select',
  },
  'annahmen': {
    'vorgang': 'applookup/select',
    'entscheidung': 'applookup/select',
    'aussage': 'string/textarea',
    'gewissheit': 'lookup/select',
    'status': 'lookup/radio',
    'pruefdatum': 'date/date',
    'pruefergebnis': 'string/textarea',
    'pruefer_vorname': 'string/text',
    'pruefer_nachname': 'string/text',
  },
  'erkenntnisse': {
    'vorgang': 'applookup/select',
    'entscheidung': 'applookup/select',
    'annahme': 'applookup/select',
    'art': 'lookup/radio',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'erfassungsdatum': 'date/date',
    'geltungsbereich': 'string/textarea',
    'gewissheit': 'lookup/select',
    'herkunft': 'lookup/radio',
  },
  'regeln': {
    'titel': 'string/text',
    'regeltext': 'string/textarea',
    'geltungsbereich': 'string/textarea',
    'erkenntnis': 'applookup/select',
    'entscheidung': 'applookup/select',
    'gewissheit': 'lookup/select',
    'status': 'lookup/radio',
    'freigabe_vorname': 'string/text',
    'freigabe_nachname': 'string/text',
    'freigabedatum': 'date/date',
    'pruefdatum': 'date/date',
    'ki_hinweise': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
  'vorgaenge': [
    { field: 'vorgang', entity: 'entscheidungen' },
    { field: 'vorgang', entity: 'annahmen' },
    { field: 'vorgang', entity: 'erkenntnisse' },
  ],
  'entscheidungen': [
    { field: 'entscheidung', entity: 'annahmen' },
    { field: 'entscheidung', entity: 'erkenntnisse' },
    { field: 'entscheidung', entity: 'regeln' },
  ],
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateVorgaenge = StripLookup<Vorgaenge['fields']>;
export type CreateEntscheidungen = StripLookup<Entscheidungen['fields']>;
export type CreateAnnahmen = StripLookup<Annahmen['fields']>;
export type CreateErkenntnisse = StripLookup<Erkenntnisse['fields']>;
export type CreateRegeln = StripLookup<Regeln['fields']>;