/**
 * Erkenntnis erfassen — 4-Schritt-Wizard.
 * Steps: 1) Vorgang wählen → 2) Optional Entscheidung und Annahme wählen → 3) Art, Titel, Beschreibung, Gültigkeitsbereich → 4) Gewissheit und Herkunft → Prüfen.
 * Reads: vorgaenge, entscheidungen, annahmen. Writes: erkenntnisse (via useErkenntnisErfassenFlow).
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
import { useErkenntnisErfassenFlow } from '@/lib/journey/flows/ErkenntnisErfassen';
import { tx } from '@/i18n';

export default function ErkenntnisErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useErkenntnisErfassenFlow({
    steps: { vorgang: 1, entscheidung: 2, annahme: 2, art: 3, titel: 3, beschreibung: 3, geltungsbereich: 3, gewissheit: 4, herkunft: 4 },
    items: {
      vorgang: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldText(r, 'fachgebiet'),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
      entscheidung: (r, ctx) => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: ctx.ref('vorgang') }),
      annahme: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'aussage'),
        subtitle: ctx.ref('vorgang'),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
    },
  });
  const f = flow.forms.erkenntnisse;

  return (
    <IntentWizardShell
      title={tx('Erkenntnis erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte fest, was du bei einem Vorgang gelernt hast.'),
        needs: [tx('Den Vorgang'), tx('Eine kurze Beschreibung der Erkenntnis')],
      }}
    >
      <WizardStep label={tx('Vorgang')} heading={tx('Vorgang auswählen')} description={tx('Zu welchem Vorgang gehört die Erkenntnis?')}>
        <EntitySelectStep {...flow.picks.vorgang.select} {...flow.pick('vorgang')} searchPlaceholder={tx('Titel oder Fachgebiet …')} />
      </WizardStep>

      <WizardStep label={tx('Bezug')} heading={tx('Entscheidung und Annahme')} description={tx('Optional: Woraus hat sich die Erkenntnis ergeben?')} needs={['vorgang']}>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{tx('Entscheidung (optional)')}</h3>
            <EntitySelectStep {...flow.picks.entscheidung.select} {...flow.pick('entscheidung')} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{tx('Annahme (optional)')}</h3>
            <EntitySelectStep {...flow.picks.annahme.select} {...flow.pick('annahme')} />
          </div>
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Inhalt')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Inhalt')} description={tx('Was hast du erkannt und wo gilt es?')} needs={['vorgang']}>
        <div className="space-y-4">
          <Bound form={f} name="art" />
          <Bound form={f} name="titel" />
          <Bound form={f} name="beschreibung" rows={4} />
          <Bound form={f} name="geltungsbereich" rows={3} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Einstufung')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Einstufung')} description={tx('Wie sicher ist die Erkenntnis und woher stammt sie?')} needs={['vorgang']}>
        <div className="space-y-4">
          <Bound form={f} name="gewissheit" />
          <Bound form={f} name="herkunft" />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Erkenntnis wird mit dem heutigen Datum erfasst und mit dem Vorgang verknüpft.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Regel ableiten'), href: '#/intents/regel-ableiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
