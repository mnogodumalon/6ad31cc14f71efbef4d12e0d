/**
 * Entscheidung festhalten — 4-Schritt-Wizard.
 * Steps: 1) Vorgang wählen → 2) Frage, Lösungsweg, Alternativen, Begründung → 3) Herkunft & Gewissheit → 4) Optional Annahme → Prüfen & anlegen.
 * Reads: vorgaenge. Writes: entscheidungen, annahmen (optional, verknüpft mit der Entscheidung).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useEntscheidungFesthaltenFlow } from '@/lib/journey/flows/EntscheidungFesthalten';
import { tx } from '@/i18n';

export default function EntscheidungFesthaltenPage() {
  const [step, setStep] = useState(1);
  const flow = useEntscheidungFesthaltenFlow({
    steps: {
      vorgang: 1,
      titel: 2, fragestellung: 2, loesungsweg: 2, alternativen: 2, begruendung: 2,
      entscheider_vorname: 2, entscheider_nachname: 2,
      herkunft: 3, gewissheit: 3,
      aussage: 4,
    },
    items: {
      vorgang: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldText(r, 'fachgebiet'),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
    },
  });

  return (
    <IntentWizardShell
      title={tx('Entscheidung festhalten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte fest, was du entschieden hast und warum — samt Annahmen dahinter.'),
        needs: [tx('Den Vorgang, zu dem die Entscheidung gehört'), tx('Begründung und verworfene Alternativen')],
      }}
    >
      <WizardStep label={tx('Vorgang')} description={tx('Zu welchem Vorgang gehört die Entscheidung?')}>
        <EntitySelectStep
          {...flow.picks.vorgang.select}
          {...flow.pick('vorgang')}
          searchPlaceholder={tx('Titel des Vorgangs …')}
        />
      </WizardStep>

      <WizardStep label={tx('Entscheidung')} description={tx('Was war die Frage, was wurde gewählt und warum?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.entscheidungen} name="titel" />
          <Bound form={flow.forms.entscheidungen} name="fragestellung" />
          <Bound form={flow.forms.entscheidungen} name="loesungsweg" />
          <Bound form={flow.forms.entscheidungen} name="alternativen" />
          <Bound form={flow.forms.entscheidungen} name="begruendung" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={flow.forms.entscheidungen} name="entscheider_vorname" />
            <Bound form={flow.forms.entscheidungen} name="entscheider_nachname" />
          </div>
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Herkunft und Gewissheit')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Gewissheit')} description={tx('Woher stammt die Entscheidung und wie sicher ist sie?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.entscheidungen} name="herkunft" />
          <Bound form={flow.forms.entscheidungen} name="gewissheit" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Annahme')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Annahme')} description={tx('Optional: Worauf beruht die Entscheidung? Leer lassen, wenn es keine Annahme gibt.')}>
        <div className="space-y-4">
          <Bound form={flow.forms.annahmen} name="aussage" />
          <Bound form={flow.forms.annahmen} name="gewissheit" />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'entscheidungsdatum', label: tx('Entscheidungsdatum'), value: tx('Heute') },
            ]}
            whatHappensNext={tx('Die Entscheidung wird angelegt; eine Annahme wird mit ihr verknüpft und bleibt offen, bis du sie prüfst.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Annahme prüfen'), href: '#/intents/annahme-pruefen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Spätere Erkenntnisse und Regeln können sich auf diese Entscheidung beziehen.')}
        />
      )}
    </IntentWizardShell>
  );
}
