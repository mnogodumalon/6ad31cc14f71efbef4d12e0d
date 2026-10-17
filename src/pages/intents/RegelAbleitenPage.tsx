/**
 * Regel ableiten — 4-Schritt-Wizard mit Prüfung.
 * Steps: 1) Erkenntnis oder Entscheidung wählen → 2) Titel, Regeltext, Geltungsbereich → 3) Gewissheit & KI-Hinweise → 4) Nächste Überprüfung → Prüfen & anlegen.
 * Reads: erkenntnisse, entscheidungen. Writes: regeln (Status fest „entwurf“, Freigabe bleibt ein eigener Schritt).
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
import { useRegelAbleitenFlow } from '@/lib/journey/flows/RegelAbleiten';
import { tx } from '@/i18n';

export default function RegelAbleitenPage() {
  const [step, setStep] = useState(1);
  const flow = useRegelAbleitenFlow({
    steps: { erkenntnis: 1, entscheidung: 1, titel: 2, regeltext: 2, geltungsbereich: 2, gewissheit: 3, ki_hinweise: 3, pruefdatum: 4 },
    items: {
      erkenntnis: r => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: [fieldLookup(r, 'art')?.label, fieldLookup(r, 'gewissheit')?.label].filter(Boolean).join(' · ') }),
      entscheidung: r => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: fieldLookup(r, 'gewissheit')?.label }),
    },
  });
  const regel = flow.forms.regeln;

  return (
    <IntentWizardShell
      title={tx('Regel ableiten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Aus einer Erkenntnis oder Entscheidung eine neue Regel als Entwurf anlegen.'),
        needs: [tx('Erkenntnis oder Entscheidung als Grundlage'), tx('Titel und Regeltext')],
      }}
    >
      <WizardStep label={tx('Grundlage')} description={tx('Aus welcher Erkenntnis oder Entscheidung leitest du die Regel ab?')}>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{tx('Erkenntnis')}</h3>
            <EntitySelectStep {...flow.picks.erkenntnis.select} {...flow.pick('erkenntnis')} searchPlaceholder={tx('Erkenntnis suchen …')} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{tx('Entscheidung')}</h3>
            <EntitySelectStep {...flow.picks.entscheidung.select} {...flow.pick('entscheidung')} searchPlaceholder={tx('Entscheidung suchen …')} />
          </div>
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Regel formulieren')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Formulierung')} description={tx('Gib der Regel einen Titel, einen Text und sag, wo sie gilt.')}>
        <div className="space-y-4">
          <Bound form={regel} name="titel" />
          <Bound form={regel} name="regeltext" rows={4} />
          <Bound form={regel} name="geltungsbereich" rows={3} />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Gewissheit')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Gewissheit')} description={tx('Wie sicher ist die Regel — und wo hat die KI mitgewirkt?')}>
        <div className="space-y-4">
          <Bound form={regel} name="gewissheit" />
          <Bound form={regel} name="ki_hinweise" rows={3} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Überprüfung')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Überprüfung')} description={tx('Wann soll die Regel das nächste Mal überprüft werden?')}>
        <div className="space-y-4">
          <Bound form={regel} name="pruefdatum" />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: tx('Entwurf') }]}
            whatHappensNext={tx('Die Regel wird als Entwurf gespeichert. Die Freigabe erfolgt separat durch eine Person.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Die Regel ist ein Entwurf und gilt erst nach der Freigabe.')}
          next={[
            { label: tx('Regel freigeben'), href: '#/intents/regel-freigeben' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
