/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'vorgaenge' | 'entscheidungen' | 'annahmen' | 'erkenntnisse' | 'regeln';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "vorgaenge": "titel" | "beschreibung" | "fachgebiet" | "anforderungen" | "randbedingungen" | "werkzeuge" | "verantwortlich_vorname" | "verantwortlich_nachname";
  "entscheidungen": "titel" | "fragestellung" | "loesungsweg" | "alternativen" | "begruendung" | "entscheider_vorname" | "entscheider_nachname";
  "annahmen": "aussage" | "pruefergebnis" | "pruefer_vorname" | "pruefer_nachname";
  "erkenntnisse": "titel" | "beschreibung" | "geltungsbereich";
  "regeln": "titel" | "regeltext" | "geltungsbereich" | "freigabe_vorname" | "freigabe_nachname" | "ki_hinweise";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "vorgaenge": never;
  "entscheidungen": "vorgang";
  "annahmen": "vorgang" | "entscheidung";
  "erkenntnisse": "vorgang" | "entscheidung" | "annahme";
  "regeln": "erkenntnis" | "entscheidung";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "vorgaenge": {
    "key": "vorgaenge",
    "appId": "6ad31ca255a4def38e1cbd19",
    "label": "Vorgänge",
    "pascal": "Vorgaenge",
    "single": "VorgaengeEntry"
  },
  "entscheidungen": {
    "key": "entscheidungen",
    "appId": "6ad31ca6ced3f4024ebaa047",
    "label": "Entscheidungen",
    "pascal": "Entscheidungen",
    "single": "EntscheidungenEntry"
  },
  "annahmen": {
    "key": "annahmen",
    "appId": "6ad31ca71f21d41ca90368b0",
    "label": "Annahmen",
    "pascal": "Annahmen",
    "single": "AnnahmenEntry"
  },
  "erkenntnisse": {
    "key": "erkenntnisse",
    "appId": "6ad31ca811aa8ca038106872",
    "label": "Erkenntnisse",
    "pascal": "Erkenntnisse",
    "single": "ErkenntnisseEntry"
  },
  "regeln": {
    "key": "regeln",
    "appId": "6ad31ca83405d7a782f8b809",
    "label": "Regeln",
    "pascal": "Regeln",
    "single": "RegelnEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "vorgaenge": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "fachgebiet": {
      "key": "fachgebiet",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Fachgebiet",
      "writable": true,
      "maxLength": 4000
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "in_bearbeitung",
        "abgeschlossen",
        "abgebrochen",
        "geplant"
      ]
    },
    "startdatum": {
      "key": "startdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Startdatum",
      "writable": true
    },
    "abschlussdatum": {
      "key": "abschlussdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Abschlussdatum",
      "writable": true
    },
    "anforderungen": {
      "key": "anforderungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Ursprüngliche Anforderungen",
      "writable": true
    },
    "randbedingungen": {
      "key": "randbedingungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Tatsächliche Randbedingungen",
      "writable": true
    },
    "werkzeuge": {
      "key": "werkzeuge",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Eingesetzte Werkzeuge und Modelle",
      "writable": true,
      "maxLength": 4000
    },
    "verantwortlich_vorname": {
      "key": "verantwortlich_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname der verantwortlichen Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "verantwortlich_nachname": {
      "key": "verantwortlich_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname der verantwortlichen Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    }
  },
  "entscheidungen": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad31ca255a4def38e1cbd19",
      "targetEntity": "vorgaenge"
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel der Entscheidung",
      "writable": true,
      "maxLength": 4000
    },
    "entscheidungsdatum": {
      "key": "entscheidungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Entscheidungsdatum",
      "writable": true
    },
    "fragestellung": {
      "key": "fragestellung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Entscheidungsfrage",
      "writable": true
    },
    "loesungsweg": {
      "key": "loesungsweg",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Gewählter Lösungsweg",
      "writable": true
    },
    "alternativen": {
      "key": "alternativen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Verworfene Alternativen",
      "writable": true
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "entscheider_vorname": {
      "key": "entscheider_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname der entscheidenden Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "entscheider_nachname": {
      "key": "entscheider_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname der entscheidenden Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "herkunft": {
      "key": "herkunft",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Herkunft",
      "writable": true,
      "options": [
        "mensch",
        "ki_gestuetzt",
        "gemeinsam"
      ]
    },
    "gewissheit": {
      "key": "gewissheit",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Gewissheit",
      "writable": true,
      "options": [
        "hypothese",
        "plausibel",
        "gesichert",
        "belegt"
      ]
    }
  },
  "annahmen": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad31ca255a4def38e1cbd19",
      "targetEntity": "vorgaenge"
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Entscheidung",
      "writable": true,
      "targetAppId": "6ad31ca6ced3f4024ebaa047",
      "targetEntity": "entscheidungen"
    },
    "aussage": {
      "key": "aussage",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Aussage der Annahme",
      "writable": true
    },
    "gewissheit": {
      "key": "gewissheit",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Gewissheit",
      "writable": true,
      "options": [
        "hypothese",
        "plausibel",
        "gesichert"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "offen",
        "bestaetigt",
        "widerlegt"
      ]
    },
    "pruefdatum": {
      "key": "pruefdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Prüfdatum",
      "writable": true
    },
    "pruefergebnis": {
      "key": "pruefergebnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Prüfergebnis und Beleg",
      "writable": true
    },
    "pruefer_vorname": {
      "key": "pruefer_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname der prüfenden Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "pruefer_nachname": {
      "key": "pruefer_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname der prüfenden Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    }
  },
  "erkenntnisse": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad31ca255a4def38e1cbd19",
      "targetEntity": "vorgaenge"
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Entscheidung",
      "writable": true,
      "targetAppId": "6ad31ca6ced3f4024ebaa047",
      "targetEntity": "entscheidungen"
    },
    "annahme": {
      "key": "annahme",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Annahme",
      "writable": true,
      "targetAppId": "6ad31ca71f21d41ca90368b0",
      "targetEntity": "annahmen"
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Art der Erkenntnis",
      "writable": true,
      "options": [
        "ergebnis",
        "grenze",
        "lerneffekt",
        "abweichung"
      ]
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "erfassungsdatum": {
      "key": "erfassungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Erfassungsdatum",
      "writable": true
    },
    "geltungsbereich": {
      "key": "geltungsbereich",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Gültigkeitsbereich und Grenzbedingung",
      "writable": true
    },
    "gewissheit": {
      "key": "gewissheit",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Gewissheit",
      "writable": true,
      "options": [
        "hypothese",
        "plausibel",
        "gesichert",
        "belegt"
      ]
    },
    "herkunft": {
      "key": "herkunft",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Herkunft",
      "writable": true,
      "options": [
        "mensch",
        "ki_gestuetzt",
        "messung"
      ]
    }
  },
  "regeln": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel der Regel",
      "writable": true,
      "maxLength": 4000
    },
    "regeltext": {
      "key": "regeltext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Regeltext",
      "writable": true
    },
    "geltungsbereich": {
      "key": "geltungsbereich",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Geltungsbereich",
      "writable": true
    },
    "erkenntnis": {
      "key": "erkenntnis",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Abgeleitet aus Erkenntnis",
      "writable": true,
      "targetAppId": "6ad31ca811aa8ca038106872",
      "targetEntity": "erkenntnisse"
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Abgeleitet aus Entscheidung",
      "writable": true,
      "targetAppId": "6ad31ca6ced3f4024ebaa047",
      "targetEntity": "entscheidungen"
    },
    "gewissheit": {
      "key": "gewissheit",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Gewissheit",
      "writable": true,
      "options": [
        "hypothese",
        "plausibel",
        "gesichert",
        "belegt"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "entwurf",
        "freigegeben",
        "ueberholt"
      ]
    },
    "freigabe_vorname": {
      "key": "freigabe_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Vorname der freigebenden Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "freigabe_nachname": {
      "key": "freigabe_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Nachname der freigebenden Person",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "freigabedatum": {
      "key": "freigabedatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Freigabedatum",
      "writable": true
    },
    "pruefdatum": {
      "key": "pruefdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Nächste Überprüfung",
      "writable": true
    },
    "ki_hinweise": {
      "key": "ki_hinweise",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Hinweise zur KI-Nutzung",
      "writable": true
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "vorgaenge": [
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    }
  ],
  "entscheidungen": [
    {
      "kind": "choice",
      "field": "herkunft",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "gewissheit",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    }
  ],
  "annahmen": [
    {
      "kind": "choice",
      "field": "gewissheit",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "entscheidung",
      "targetEntity": "entscheidungen"
    }
  ],
  "erkenntnisse": [
    {
      "kind": "choice",
      "field": "art",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "gewissheit",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "herkunft",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "entscheidung",
      "targetEntity": "entscheidungen"
    },
    {
      "kind": "record",
      "field": "annahme",
      "targetEntity": "annahmen"
    }
  ],
  "regeln": [
    {
      "kind": "choice",
      "field": "gewissheit",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 3
    },
    {
      "kind": "record",
      "field": "erkenntnis",
      "targetEntity": "erkenntnisse"
    },
    {
      "kind": "record",
      "field": "entscheidung",
      "targetEntity": "entscheidungen"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "vorgaenge": [
    "titel"
  ],
  "entscheidungen": [
    "titel"
  ],
  "annahmen": [
    "aussage"
  ],
  "erkenntnisse": [
    "titel"
  ],
  "regeln": [
    "titel"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
