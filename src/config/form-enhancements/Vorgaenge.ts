// Auto-generated. Per-entity form-enhancements config for "Vorgänge".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "status", "fachgebiet", {"row": ["startdatum", "abschlussdatum"], "cols": "1fr 1fr"}, {"row": ["verantwortlich_vorname", "verantwortlich_nachname"]}, "werkzeuge", "beschreibung", "anforderungen", "randbedingungen"],
  defaults: {
    'status': { kind: 'lookup', key: 'geplant', label: 'Geplant' },
    'startdatum': { kind: 'today' },
  },
  computed: {
    '_vorgang_dauer_tage': { kind: 'dateDiff', from: 'startdatum', to: 'abschlussdatum', unit: 'days' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
