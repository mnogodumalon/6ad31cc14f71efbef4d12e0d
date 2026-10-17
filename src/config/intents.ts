/**
 * intents.ts — registry of intent workflow pages (Phase 2).
 *
 * The intents orchestrator REGISTERS every page it creates here; the sidebar
 * section (IntentsNav) renders automatically from this list — no Layout edit
 * needed. Keep `path` identical to the route added in App.tsx's
 * `<custom:routes>` block.
 *
 * ONLY write inside the marker blocks — everything outside is scaffold and is
 * overwritten on the next /build/update.
 *
 *   <custom:intent-imports>
 *   import { IconCalendarPlus } from '@tabler/icons-react';
 *   </custom:intent-imports>
 *   …
 *   <custom:intents>
 *   { path: '/intents/neue-buchung', label: { de: 'Neue Buchung', en: 'New booking' }, icon: IconCalendarPlus, description: { de: 'Buchung in 3 Schritten anlegen', en: 'Create a booking in 3 steps' } },
 *   </custom:intents>
 */
import type { ComponentType } from 'react';

// <custom:intent-imports>
import { IconGavel, IconChecklist, IconBulb, IconRulerMeasure, IconRosetteDiscountCheck } from '@tabler/icons-react';
// </custom:intent-imports>

export interface IntentLink {
  /** Route path as wired in App.tsx (HashRouter), e.g. '/intents/neue-buchung'. */
  path: string;
  /**
   * Short sidebar label (1–3 words). Preferred: both UI languages
   * ({ de, en } — the runtime switcher picks the active one; cs stays
   * readable for legacy entries). A plain string stays valid and renders as-is.
   */
  label: string | { de?: string; en?: string; cs?: string };
  /** Tabler icon COMPONENT reference (not rendered JSX), e.g. IconCalendarPlus. */
  icon?: ComponentType<{ size?: number | string; className?: string; stroke?: number | string }>;
  /**
   * One-line purpose. Same shape as `label`: prefer both UI languages so a
   * language switch reaches it; a plain string stays valid.
   */
  description?: string | { de?: string; en?: string; cs?: string };
}

export const INTENTS: IntentLink[] = [
  // <custom:intents>
  { path: '/intents/entscheidung-festhalten', label: { de: 'Entscheidung festhalten', en: 'Record a decision' }, icon: IconGavel, description: 'Eine Entscheidung zu einem Vorgang erfassen, mit Alternativen, Begründung, Herkunft und Gewissheit, und dabei gleich Annahmen festhalten, auf denen sie beruht.' },
  { path: '/intents/annahme-pruefen', label: { de: 'Annahme prüfen', en: 'Review an assumption' }, icon: IconChecklist, description: 'Eine offene Annahme bestätigen oder widerlegen, mit Beleg, und bei Bedarf direkt eine Erkenntnis daraus festhalten.' },
  { path: '/intents/erkenntnis-erfassen', label: { de: 'Erkenntnis erfassen', en: 'Capture a finding' }, icon: IconBulb, description: 'Eine Erkenntnis zu einem Vorgang erfassen und mit Entscheidung oder Annahme verknüpfen, mit Gewissheit und Herkunft.' },
  { path: '/intents/regel-ableiten', label: { de: 'Regel ableiten', en: 'Derive a rule' }, icon: IconRulerMeasure, description: 'Aus einer Erkenntnis oder Entscheidung eine neue Regel als Entwurf anlegen. Freigabe bleibt ein eigener, menschlicher Schritt.' },
  { path: '/intents/regel-freigeben', label: { de: 'Regel freigeben', en: 'Approve a rule' }, icon: IconRosetteDiscountCheck, description: 'Eine Regel im Entwurf durch eine Person freigeben oder als überholt markieren. Die KI gibt nie frei.' },
  // </custom:intents>
];

/**
 * True only in the Phase-1 deploy bundle (the service flips it): the sidebar
 * then shows ghost rows ("werden erstellt…") until Phase 2 registers the real
 * pages and sets this back to false. Lives OUTSIDE the custom markers on
 * purpose — a scaffold update resets it to false (self-healing if Phase 2
 * never ran).
 */
export const INTENTS_PENDING = false;

/**
 * When the Phase-1 bundle was deployed (ISO, set by the service together with
 * INTENTS_PENDING). The sidebar stops showing the ghost row PENDING_MAX_MINUTES
 * later on its own: a Phase 2 that ended red (or never ran) used to leave a
 * pulsing "werden erstellt …" in every deployed Phase-1 bundle forever — no
 * code path redeploys Phase 1 without the flag (live 03.09.2026).
 */
export const INTENTS_PENDING_SINCE: string | null = '2026-10-17T07:00:29+00:00';
export const PENDING_MAX_MINUTES = 30;
