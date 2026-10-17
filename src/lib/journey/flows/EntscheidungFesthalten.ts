/**
 * useEntscheidungFesthaltenFlow — the plumbing of the flow « Entscheidung festhalten », generated from the plan.
 *
 * Writes `entscheidungen`: asks `vorgang`, `titel`, `fragestellung`, `loesungsweg`, `alternativen`, `begruendung`, `entscheider_vorname`, `entscheider_nachname`, `herkunft`, `gewissheit`; sets `entscheidungsdatum` itself.
Writes `annahmen` (only when the person fills it): asks `vorgang`, `aussage`, `gewissheit`; sets `status` itself; links `entscheidung` ← the created `entscheidungen`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 4)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useEntscheidungFesthaltenFlow({
 *     steps: { vorgang: 2, titel: 3, fragestellung: 3, loesungsweg: 3, alternativen: 3, begruendung: 3, entscheider_vorname: 3, entscheider_nachname: 3, herkunft: 3, gewissheit: 3, aussage: 3 },
 *     items: { vorgang: r => ({ id: r.id, title: fieldText(r, 'titel') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.vorgang.select} {...flow.pick('vorgang')} />
 *     <EntitySelectStep {...flow.picks.annahmen_vorgang.select} {...flow.pick('vorgang')} />
 *     <Bound form={flow.forms.entscheidungen} name="titel" />
 *     <Bound form={flow.forms.entscheidungen} name="fragestellung" />
 *     <Bound form={flow.forms.entscheidungen} name="loesungsweg" />
 *     <Bound form={flow.forms.entscheidungen} name="alternativen" />
 *     <Bound form={flow.forms.entscheidungen} name="begruendung" />
 *     <Bound form={flow.forms.entscheidungen} name="entscheider_vorname" />
 *     <Bound form={flow.forms.entscheidungen} name="entscheider_nachname" />
 *     <Bound form={flow.forms.entscheidungen} name="herkunft" />
 *     <Bound form={flow.forms.entscheidungen} name="gewissheit" />
 *     <Bound form={flow.forms.annahmen} name="aussage" />
 *     <Bound form={flow.forms.annahmen} name="gewissheit" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type EntscheidungFesthaltenFieldKey = 'alternativen' | 'aussage' | 'begruendung' | 'entscheider_nachname' | 'entscheider_vorname' | 'fragestellung' | 'gewissheit' | 'herkunft' | 'loesungsweg' | 'titel' | 'vorgang';

export interface EntscheidungFesthaltenForms {
  entscheidungen: StepForm<'entscheidungen'>;
  annahmen: StepForm<'annahmen'>;
}

// Alias so the option generics stay readable.
type Key = EntscheidungFesthaltenFieldKey;

export interface EntscheidungFesthaltenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorgang?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    annahmen_vorgang?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"alternativen": 3, "aussage": 3, "begruendung": 3, "entscheider_nachname": 3, "entscheider_vorname": 3, "fragestellung": 3, "gewissheit": 3, "herkunft": 3, "loesungsweg": 3, "titel": 3, "vorgang": 2};
export const ENTSCHEIDUNGFESTHALTEN_REVIEW_STEP = 4;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useEntscheidungFesthaltenFlow(options: EntscheidungFesthaltenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const entscheidungen = useStepForm('entscheidungen', {
    fields: ["vorgang", "titel", "fragestellung", "loesungsweg", "alternativen", "begruendung", "entscheider_vorname", "entscheider_nachname", "herkunft", "gewissheit"],
    steps: only(steps, ["vorgang", "titel", "fragestellung", "loesungsweg", "alternativen", "begruendung", "entscheider_vorname", "entscheider_nachname", "herkunft", "gewissheit"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["vorgang", "titel", "fragestellung", "loesungsweg", "alternativen", "begruendung", "entscheider_vorname", "entscheider_nachname", "herkunft", "gewissheit"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorgang", "titel", "fragestellung", "loesungsweg", "alternativen", "begruendung", "entscheider_vorname", "entscheider_nachname", "herkunft", "gewissheit"]),
  });
  const annahmen = useStepForm('annahmen', {
    fields: ["vorgang", "aussage", "gewissheit"],
    steps: only(steps, ["vorgang", "aussage", "gewissheit"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["vorgang", "aussage", "gewissheit"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorgang", "aussage", "gewissheit"]),
  });
  const forms: EntscheidungFesthaltenForms = { entscheidungen, annahmen };
  const formList: StepForm[] = [entscheidungen, annahmen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorgang: useRecordSearch(servicePort, 'vorgaenge', withPickPolicy('vorgang', {
      searchFields: ["titel", "fachgebiet"] as never,
      filter: "r.v_status in ['geplant', 'in_bearbeitung']",
      where: (r: JourneyRecord) => ["geplant", "in_bearbeitung"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.vorgang as never,
    })),
    annahmen_vorgang: useRecordSearch(servicePort, 'vorgaenge', withPickPolicy('annahmen_vorgang', {
      searchFields: ["titel", "fachgebiet"] as never,
      filter: "r.v_status in ['geplant', 'in_bearbeitung']",
      where: (r: JourneyRecord) => ["geplant", "in_bearbeitung"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.annahmen_vorgang as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:entscheidung-festhalten:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:entscheidung-festhalten:write:${entity}.${field}`,
  });
  const picks = {
    vorgang: { ...searches.vorgang, select: { ...searches.vorgang.select, create: true as boolean, hint: hintFor('vorgang', 'vorgaenge', {"conditions": [{"field": "status", "op": "in", "value": ["geplant", "in_bearbeitung"]}], "mode": "all"} as PickWhere | null) } },
    annahmen_vorgang: { ...searches.annahmen_vorgang, select: { ...searches.annahmen_vorgang.select, create: true as boolean, hint: hintFor('annahmen_vorgang', 'vorgaenge', {"conditions": [{"field": "status", "op": "in", "value": ["geplant", "in_bearbeitung"]}], "mode": "all"} as PickWhere | null) } },
  };

  const annahmenFilled = hasValues(annahmen);
  const plan: PlanStep[] = [
    {
      key: 'entscheidungen', entity: 'entscheidungen', form: entscheidungen, primary: true,
      values: (): FormValues => ({
        entscheidungsdatum: policyFixedValue('entscheidungen', 'entscheidungsdatum') ?? todayIso(),
      }),
    },
    ...(annahmenFilled ? [{
      key: 'annahmen', entity: 'annahmen', form: annahmen,      needs: ['entscheidungen'],
      link: { entscheidung: 'entscheidungen' },

      values: (): FormValues => ({
        status: policyFixedValue('annahmen', 'status') ?? "offen",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('annahmen', 'status', policyFixedValue('annahmen', 'status') ?? "offen")],
    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'entscheidung-festhalten' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: EntscheidungFesthaltenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: EntscheidungFesthaltenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'entscheidung-festhalten' as const,
    draftKey: 'entscheidung-festhalten' as const,
    entity: 'entscheidungen' as const,
    form: entscheidungen,
    forms, formList, picks, submit, steps,    reviewStep: ENTSCHEIDUNGFESTHALTEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type EntscheidungFesthaltenFlow = ReturnType<typeof useEntscheidungFesthaltenFlow>;
