// Auto-generated. Per-entity form-enhancements config for "Regeln".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", {"row": ["gewissheit", "status"], "cols": "1fr 1fr"}, "regeltext", {"row": ["erkenntnis", "entscheidung"], "cols": "1fr 1fr"}, {"row": ["freigabe_vorname", "freigabe_nachname"]}, {"row": ["freigabedatum", "pruefdatum"], "cols": "1fr 1fr"}, "geltungsbereich", "ki_hinweise"],
  defaults: {
    'status': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
