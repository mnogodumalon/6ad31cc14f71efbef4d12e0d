// Auto-generated. Per-entity form-enhancements config for "Erkenntnisse".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "vorgang", {"row": ["art", "gewissheit"], "cols": "1fr 1fr"}, "herkunft", {"row": ["entscheidung", "annahme"], "cols": "1fr 1fr"}, "erfassungsdatum", "beschreibung", "geltungsbereich"],
  defaults: {
    'erfassungsdatum': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
