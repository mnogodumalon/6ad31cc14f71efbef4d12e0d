// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "entscheidung-festhalten": [
    "Legt an: annahmen, entscheidungen",
    "Automatisch: entscheidungsdatum (heutiges Datum, automatisch), status (fester Wert „offen“)"
  ],
  "annahme-pruefen": [
    "Legt an: erkenntnisse",
    "Ändert: annahmen",
    "Automatisch: pruefdatum (heutiges Datum, automatisch), erfassungsdatum (heutiges Datum, automatisch)"
  ],
  "erkenntnis-erfassen": [
    "Legt an: erkenntnisse",
    "Automatisch: erfassungsdatum (heutiges Datum, automatisch)"
  ],
  "regel-ableiten": [
    "Legt an: regeln",
    "Automatisch: status (fester Wert „entwurf“)"
  ],
  "regel-freigeben": [
    "Ändert: regeln",
    "Automatisch: freigabedatum (heutiges Datum, automatisch)"
  ]
};

export const PLAN_SUMMARY = "Ein organisationales Gedächtnis, das unabhängig von einzelnen KI-Werkzeugen festhält, was die Organisation über ihre Arbeit weiß. Zu jedem Vorgang werden Anforderungen, Randbedingungen, Entscheidungen, Annahmen, Erkenntnisse und daraus abgeleitete Regeln erfasst. Überall wird festgehalten, wie sicher das Wissen ist und woher es stammt (Mensch, KI oder Messung). Regeln werden von Menschen freigegeben, nicht von der KI.";

/** slug → the lists a flow writes (the plan's Schreibliste). The nav leaves a
 *  flow out for a user who may not write one of them (lib/permissions.ts). */
export const FLOW_ENTITIES: Record<string, string[]> = {
  "entscheidung-festhalten": [
    "annahmen",
    "entscheidungen"
  ],
  "annahme-pruefen": [
    "annahmen",
    "erkenntnisse"
  ],
  "erkenntnis-erfassen": [
    "erkenntnisse"
  ],
  "regel-ableiten": [
    "regeln"
  ],
  "regel-freigeben": [
    "regeln"
  ]
};
