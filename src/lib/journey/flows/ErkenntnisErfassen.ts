/**
 * useErkenntnisErfassenFlow — the plumbing of the flow « Erkenntnis erfassen », generated from the plan.
 *
 * Writes `erkenntnisse`: asks `vorgang`, `entscheidung`, `annahme`, `art`, `titel`, `beschreibung`, `geltungsbereich`, `gewissheit`, `herkunft`; sets `erfassungsdatum` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 5)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useErkenntnisErfassenFlow({
 *     steps: { vorgang: 1, entscheidung: 2, annahme: 3, art: 4, titel: 4, beschreibung: 4, geltungsbereich: 4, gewissheit: 4, herkunft: 4 },
 *     items: { vorgang: r => ({ id: r.id, title: fieldText(r, 'titel') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.vorgang.select} {...flow.pick('vorgang')} />
 *     <EntitySelectStep {...flow.picks.entscheidung.select} {...flow.pick('entscheidung')} />
 *     <EntitySelectStep {...flow.picks.annahme.select} {...flow.pick('annahme')} />
 *     <Bound form={flow.forms.erkenntnisse} name="art" />
 *     <Bound form={flow.forms.erkenntnisse} name="titel" />
 *     <Bound form={flow.forms.erkenntnisse} name="beschreibung" />
 *     <Bound form={flow.forms.erkenntnisse} name="geltungsbereich" />
 *     <Bound form={flow.forms.erkenntnisse} name="gewissheit" />
 *     <Bound form={flow.forms.erkenntnisse} name="herkunft" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type ErkenntnisErfassenFieldKey = 'annahme' | 'art' | 'beschreibung' | 'entscheidung' | 'geltungsbereich' | 'gewissheit' | 'herkunft' | 'titel' | 'vorgang';

export interface ErkenntnisErfassenForms {
  erkenntnisse: StepForm<'erkenntnisse'>;
}

// Alias so the option generics stay readable.
type Key = ErkenntnisErfassenFieldKey;

export interface ErkenntnisErfassenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorgang?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    entscheidung?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    annahme?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"annahme": 3, "art": 4, "beschreibung": 4, "entscheidung": 2, "geltungsbereich": 4, "gewissheit": 4, "herkunft": 4, "titel": 4, "vorgang": 1};
export const ERKENNTNISERFASSEN_REVIEW_STEP = 5;

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

export function useErkenntnisErfassenFlow(options: ErkenntnisErfassenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const erkenntnisse = useStepForm('erkenntnisse', {
    fields: ["vorgang", "entscheidung", "annahme", "art", "titel", "beschreibung", "geltungsbereich", "gewissheit", "herkunft"],
    steps: only(steps, ["vorgang", "entscheidung", "annahme", "art", "titel", "beschreibung", "geltungsbereich", "gewissheit", "herkunft"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["vorgang", "entscheidung", "annahme", "art", "titel", "beschreibung", "geltungsbereich", "gewissheit", "herkunft"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorgang", "entscheidung", "annahme", "art", "titel", "beschreibung", "geltungsbereich", "gewissheit", "herkunft"]),
  });
  const forms: ErkenntnisErfassenForms = { erkenntnisse };
  const formList: StepForm[] = [erkenntnisse];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorgang: useRecordSearch(servicePort, 'vorgaenge', withPickPolicy('vorgang', {
      searchFields: ["titel", "fachgebiet"] as never,
      toItem: options.items?.vorgang as never,
    })),
    entscheidung: useRecordSearch(servicePort, 'entscheidungen', withPickPolicy('entscheidung', {
      searchFields: ["titel"] as never,
      toItem: options.items?.entscheidung as never,
    })),
    annahme: useRecordSearch(servicePort, 'annahmen', withPickPolicy('annahme', {
      searchFields: ["aussage"] as never,
      toItem: options.items?.annahme as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:erkenntnis-erfassen:read:${entity}`);
  const picks = {
    vorgang: { ...searches.vorgang, select: { ...searches.vorgang.select, create: true as boolean, hint: hintFor('vorgang', 'vorgaenge', null as PickWhere | null) } },
    entscheidung: { ...searches.entscheidung, select: { ...searches.entscheidung.select, create: false as boolean, hint: hintFor('entscheidung', 'entscheidungen', null as PickWhere | null) } },
    annahme: { ...searches.annahme, select: { ...searches.annahme.select, create: false as boolean, hint: hintFor('annahme', 'annahmen', null as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'erkenntnisse', entity: 'erkenntnisse', form: erkenntnisse, primary: true,
      values: (): FormValues => ({
        erfassungsdatum: policyFixedValue('erkenntnisse', 'erfassungsdatum') ?? todayIso(),
      }),
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'erkenntnis-erfassen' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: ErkenntnisErfassenFieldKey) => {
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
  const pickMany = (field: ErkenntnisErfassenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'erkenntnis-erfassen' as const,
    draftKey: 'erkenntnis-erfassen' as const,
    entity: 'erkenntnisse' as const,
    form: erkenntnisse,
    forms, formList, picks, submit, steps,    reviewStep: ERKENNTNISERFASSEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type ErkenntnisErfassenFlow = ReturnType<typeof useErkenntnisErfassenFlow>;
