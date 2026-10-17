/**
 * Annahme prüfen — 4-Schritt-Wizard.
 * Steps: 1) Offene Annahme wählen → 2) Prüfergebnis und Beleg → 3) Bestätigt oder widerlegt → 4) Optional Erkenntnis erfassen → Prüfen & speichern.
 * Reads: annahmen (offen), vorgaenge, entscheidungen. Writes: annahmen (update), erkenntnisse (optional, create).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, Field, ChoiceGroup, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { ChoiceGroup } from '@/components/blocks/ChoiceGroup';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldRef } from '@/lib/journey';
import { useAnnahmePruefenFlow } from '@/lib/journey/flows/AnnahmePruefen';
import { tx } from '@/i18n';

export default function AnnahmePruefenPage() {
  const [step, setStep] = useState(1);
  const [withFinding, setWithFinding] = useState(false);
  const flow = useAnnahmePruefenFlow({
    steps: {
      annahmen: 1,
      pruefergebnis: 2, pruefer_vorname: 2, pruefer_nachname: 2, gewissheit: 2,
      status: 3,
      art: 4, titel: 4, beschreibung: 4, geltungsbereich: 4, herkunft: 4, vorgang: 4, entscheidung: 4, annahme: 4,
    },
    items: {
      annahmen: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'aussage'),
        subtitle: [fieldLookup(r, 'gewissheit')?.label, ctx.ref('vorgang')].filter(Boolean).join(' · '),
      }),
    },
  });

  const annahmeForm = flow.forms.annahmen;
  const erkenntnisForm = flow.forms.erkenntnisse;
  const target = flow.targets.annahmen.record;
  const verdictOptions = annahmeForm.choice('status').options.filter(o => o.key !== 'offen');

  const toggleFinding = (on: boolean) => {
    setWithFinding(on);
    if (!on) {
      erkenntnisForm.reset();
      return;
    }
    if (!target) return;
    const vorgangId = fieldRef(target, 'vorgang');
    const entscheidungId = fieldRef(target, 'entscheidung');
    if (vorgangId) erkenntnisForm.set('vorgang', vorgangId, flow.picks.vorgang.labelOf(vorgangId) ?? tx('Vorgang'));
    if (entscheidungId) erkenntnisForm.set('entscheidung', entscheidungId, flow.picks.entscheidung.labelOf(entscheidungId) ?? tx('Entscheidung'));
    erkenntnisForm.set('annahme', target.id, fieldText(target, 'aussage'));
  };

  const assumption = target ? (
    <div className="rounded-xl border bg-secondary/50 p-3 text-sm overflow-hidden">
      <p className="text-xs text-muted-foreground">{tx('Zu prüfende Annahme')}</p>
      <p className="font-medium break-words">{fieldText(target, 'aussage')}</p>
    </div>
  ) : null;

  return (
    <IntentWizardShell
      title={tx('Annahme prüfen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine offene Annahme bestätigen oder widerlegen — mit Beleg.'),
        needs: [tx('Die Annahme, die du prüfst'), tx('Dein Prüfergebnis mit Beleg')],
      }}
    >
      <WizardStep label={tx('Annahme')} description={tx('Welche offene Annahme hast du geprüft?')}>
        <EntitySelectStep
          {...flow.picks.annahmen.select}
          {...flow.pick('annahmen')}
          searchPlaceholder={tx('Aussage suchen …')}
          emptyText={tx('Es gibt keine offene Annahme mehr.')}
        />
      </WizardStep>

      <WizardStep label={tx('Prüfergebnis')} description={tx('Was hast du herausgefunden, und woran machst du es fest?')} needs={['annahmen']}>
        <div className="space-y-4">
          {assumption}
          <Bound form={annahmeForm} name="pruefergebnis" rows={4} hint={tx('Ergebnis und Beleg, z. B. Messung, Quelle oder Test')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={annahmeForm} name="pruefer_vorname" />
            <Bound form={annahmeForm} name="pruefer_nachname" />
          </div>
          <Bound form={annahmeForm} name="gewissheit" />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Bestätigen oder widerlegen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Urteil')} description={tx('Stimmt die Annahme oder nicht?')} needs={['annahmen']}>
        <div className="space-y-4">
          {assumption}
          <Field form={annahmeForm} name="status">
            <ChoiceGroup {...annahmeForm.choice('status')} options={verdictOptions} />
          </Field>
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => {
              if (annahmeForm.get('status') === 'offen') return tx('Wähle „Bestätigt“ oder „Widerlegt“.');
              return flow.validateStep(3);
            }}
            nextStepLabel={tx('Erkenntnis')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Erkenntnis')} description={tx('Optional: Halte fest, was du daraus gelernt hast.')} needs={['annahmen']}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={withFinding ? 'default' : 'outline'} onClick={() => toggleFinding(true)}>
              {tx('Erkenntnis erfassen')}
            </Button>
            <Button type="button" variant={withFinding ? 'outline' : 'default'} onClick={() => toggleFinding(false)}>
              {tx('Ohne Erkenntnis weiter')}
            </Button>
          </div>
          {withFinding && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {tx('Vorgang, Entscheidung und Annahme werden von der geprüften Annahme übernommen.')}
              </p>
              <Bound form={erkenntnisForm} name="art" />
              <Bound form={erkenntnisForm} name="titel" />
              <Bound form={erkenntnisForm} name="beschreibung" rows={3} />
              <Bound form={erkenntnisForm} name="geltungsbereich" rows={3} />
              <Bound form={erkenntnisForm} name="gewissheit" />
              <Bound form={erkenntnisForm} name="herkunft" />
            </div>
          )}
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => (withFinding ? flow.validateStep(4) : true)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Annahme wird mit heutigem Prüfdatum aktualisiert. Eine Erkenntnis wird nur angelegt, wenn du sie erfasst hast.')}
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
