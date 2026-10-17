/**
 * Regel freigeben — 5-Schritt-Wizard.
 * Steps: 1) Regel im Entwurf wählen → 2) Herleitung und Gewissheit prüfen → 3) Freigebende Person eintragen
 *        → 4) Freigeben oder als überholt markieren → 5) Prüfen & speichern.
 * Reads: regeln (Auswahl, Herleitung). Writes: regeln (Update: status, freigabe_vorname, freigabe_nachname, pruefdatum, freigabedatum).
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
import { useRegelFreigebenFlow } from '@/lib/journey/flows/RegelFreigeben';
import { tx } from '@/i18n';

export default function RegelFreigebenPage() {
  const [step, setStep] = useState(1);
  const flow = useRegelFreigebenFlow({
    steps: { regeln: 1, freigabe_vorname: 3, freigabe_nachname: 3, pruefdatum: 3, status: 4 },
    items: {
      regeln: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldLookup(r, 'gewissheit')?.label,
      }),
    },
  });

  const regelId = flow.pick('regeln').selectedId as string | undefined;
  const regel = regelId ? flow.picks.regeln.recordOf(regelId) : undefined;
  const erkenntnis = regel ? flow.picks.regeln.refLabel(regel, 'erkenntnis') : undefined;
  const entscheidung = regel ? flow.picks.regeln.refLabel(regel, 'entscheidung') : undefined;

  return (
    <IntentWizardShell
      title={tx('Regel freigeben')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Regel im Entwurf durch dich freigeben oder als überholt markieren.'),
        needs: [tx('Name der freigebenden Person'), tx('Herleitung der Regel')],
      }}
    >
      <WizardStep label={tx('Regel')} description={tx('Welche Regel im Entwurf möchtest du bearbeiten?')}>
        <EntitySelectStep
          {...flow.picks.regeln.select}
          {...flow.pick('regeln')}
          searchPlaceholder={tx('Titel der Regel …')}
          emptyText={tx('Keine Regel im Entwurf vorhanden. Leite zuerst eine Regel ab.')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Herleitung')}
        description={tx('Prüfe, woher die Regel stammt und wie gewiss sie ist. Die KI gibt nie frei — das entscheidest du.')}
        needs={['regeln']}
      >
        <div className="space-y-4">
          {regel ? (
            <div data-key="herleitung" className="space-y-3 overflow-hidden rounded-2xl bg-card p-4 shadow-lg">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{tx('Titel')}</p>
                <p className="break-words font-medium">{fieldText(regel, 'titel')}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{tx('Regeltext')}</p>
                <p className="whitespace-pre-wrap break-words text-sm">{fieldText(regel, 'regeltext')}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{tx('Gewissheit')}</p>
                  <p className="text-sm font-medium">{fieldLookup(regel, 'gewissheit')?.label ?? '—'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{tx('Abgeleitet aus Erkenntnis')}</p>
                  <p className="break-words text-sm">{erkenntnis ?? '—'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{tx('Abgeleitet aus Entscheidung')}</p>
                  <p className="break-words text-sm">{entscheidung ?? '—'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {tx('Die Regel ist nicht geladen. Gehe zurück und wähle sie erneut aus.')}
            </p>
          )}
          <StepNav onBack={() => setStep(1)} nextStepLabel={tx('Freigebende Person')} />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Person')}
        description={tx('Wer gibt die Regel frei, und wann soll sie wieder überprüft werden?')}
        needs={['regeln']}
      >
        <div className="space-y-4">
          <Bound form={flow.forms.regeln} name="freigabe_vorname" />
          <Bound form={flow.forms.regeln} name="freigabe_nachname" />
          <Bound form={flow.forms.regeln} name="pruefdatum" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Entscheidung')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Entscheidung')}
        description={tx('Freigeben oder als überholt markieren?')}
        needs={['regeln']}
      >
        <div className="space-y-4">
          <Bound form={flow.forms.regeln} name="status" hint={tx('Das Freigabedatum setzt das System auf heute.')} />
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
            whatHappensNext={tx('Die Regel erhält den gewählten Status und das heutige Freigabedatum.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          actions={{ copy: false, print: false }}
          next={[
            { label: tx('Weitere Regel freigeben') },
            { label: tx('Neue Regel ableiten'), href: '#/intents/regel-ableiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
