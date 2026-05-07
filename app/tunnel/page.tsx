'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics/plausible';
import { FunnelLayout } from '@/components/tunnel/FunnelLayout';
import { NavButtons } from '@/components/tunnel/NavButtons';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { FieldGroup } from '@/components/ui/FieldGroup';
import { computeAge, SENIOR_AGE_THRESHOLD } from '@/lib/campaign/resolveCampaign';

type FormValues = {
  date_naissance: string;
  code_postal: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  conjoint_present?: '0' | '1';
  conjoint_date_naissance?: string;
  conjoint_regime?: string;
  enfants: { date_naissance: string; regime: string }[];
  // Enrichment (US3) — all optional
  regime?: string;
  niveau_garantie?: '' | 'economique' | 'equilibre' | 'renforce' | 'premium';
  situation_actuelle?: '' | 'aucune_mutuelle' | 'mutuelle_actuelle' | 'prefere_ne_pas_dire';
  date_effet_souhaitee?: string;
  data_processing: boolean;
  courtier_transmission: boolean;
};

const STORAGE_KEY = 'lms.tunnel.draft.v1';

function loadDraft(): { values: Partial<FormValues>; sessionId: string; startedAtMs: number } {
  if (typeof window === 'undefined') {
    return { values: {}, sessionId: '', startedAtMs: Date.now() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sessionId) return parsed;
    }
  } catch {
    /* ignore */
  }
  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `cs_${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`
      : `cs_${Math.random().toString(36).slice(2, 12)}`;
  return { values: {}, sessionId, startedAtMs: Date.now() };
}

function saveDraft(payload: { values: Partial<FormValues>; sessionId: string; startedAtMs: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

const STEPS = ['naissance', 'codepostal', 'identite', 'famille', 'optionnel', 'consent'] as const;
const STEP_LABELS = [
  'Naissance',
  'Code postal',
  'Identité',
  'Famille',
  'Détails',
  'Consentement',
];

export default function TunnelPage() {
  return (
    <Suspense fallback={null}>
      <TunnelForm />
    </Suspense>
  );
}

function TunnelForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [legalVersions, setLegalVersions] = useState<{ cgu: string; pdc: string }>({
    cgu: '1.1',
    pdc: '1.1',
  });
  const sessionRef = useRef<{ sessionId: string; startedAtMs: number }>({
    sessionId: '',
    startedAtMs: Date.now(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    setValue,
    trigger,
    control,
  } = useForm<FormValues>({
    mode: 'onTouched',
    defaultValues: {
      conjoint_present: '0',
      enfants: [],
      data_processing: false,
      courtier_transmission: false,
    },
  });

  const enfantsArray = useFieldArray({ control, name: 'enfants' });

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const draft = loadDraft();
    sessionRef.current = { sessionId: draft.sessionId, startedAtMs: draft.startedAtMs };
    if (draft.values) {
      for (const [k, v] of Object.entries(draft.values)) {
        if (v !== undefined && v !== null) {
          // @ts-expect-error — runtime-typed key
          setValue(k, v);
        }
      }
    }
    // Prefill postal code from ?cp= when arriving from a landing page CTA.
    const cpParam = searchParams.get('cp');
    if (cpParam && /^(?:0[1-9]|[1-8]\d|9[0-5]|97)\d{3}$/.test(cpParam)) {
      setValue('code_postal', cpParam);
    }
    saveDraft({ values: draft.values, ...sessionRef.current });
    trackEvent('funnel_started');

    // Fetch the currently published legal versions so the consent record
    // references whatever is live at submission time, not a hardcoded value.
    fetch('/api/legal-versions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.cgu_version && data?.pdc_version) {
          setLegalVersions({ cgu: data.cgu_version, pdc: data.pdc_version });
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  }, [setValue, searchParams]);

  // Persist on every change.
  const watched = watch();
  useEffect(() => {
    saveDraft({ values: watched, ...sessionRef.current });
  }, [watched]);

  const dob = watch('date_naissance');
  const age = useMemo(() => (dob ? computeAge(dob) : null), [dob]);
  const isUnder55 = age !== null && age < SENIOR_AGE_THRESHOLD;

  async function next() {
    const fields: (keyof FormValues)[][] = [
      ['date_naissance'],
      ['code_postal'],
      ['nom', 'prenom'],
      [], // famille step — no validation gate (radios always have a value)
      [], // optionnel step — entirely facultative
      ['data_processing', 'courtier_transmission'],
    ];
    const ok = await trigger(fields[step]);
    if (!ok) return;
    trackEvent('funnel_step_completed', { step: STEPS[step] });
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    if (!values.courtier_transmission) {
      setServerError('Le consentement à la transmission est requis.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nom: values.nom,
        prenom: values.prenom,
        date_naissance: values.date_naissance,
        code_postal: values.code_postal,
        email: values.email || undefined,
        telephone: values.telephone || undefined,
        regime: values.regime ? Number(values.regime) : undefined,
        niveau_garantie: values.niveau_garantie ? values.niveau_garantie : undefined,
        situation_actuelle: values.situation_actuelle ? values.situation_actuelle : undefined,
        date_effet_souhaitee: values.date_effet_souhaitee || undefined,
        ...(() => {
          const titulaireRegime = values.regime ? Number(values.regime) : 1;
          const conjointPresent = (Number(values.conjoint_present ?? '0') as 0 | 1);
          const enfants = (values.enfants ?? [])
            .filter((e) => e.date_naissance)
            .map((e) => ({
              date_naissance: e.date_naissance,
              regime: e.regime ? Number(e.regime) : titulaireRegime,
            }));
          return {
            conjoint_present: conjointPresent,
            conjoint_date_naissance:
              conjointPresent === 1 && values.conjoint_date_naissance
                ? values.conjoint_date_naissance
                : undefined,
            conjoint_regime:
              conjointPresent === 1
                ? values.conjoint_regime
                  ? Number(values.conjoint_regime)
                  : titulaireRegime
                : undefined,
            enfants_dates_naissance: enfants.length
              ? enfants.map((e) => e.date_naissance)
              : isUnder55
              ? []
              : undefined,
            enfants_regimes: enfants.length ? enfants.map((e) => e.regime) : undefined,
          };
        })(),
        consent: {
          data_processing: values.data_processing,
          courtier_transmission: true as const,
          cgu_version: legalVersions.cgu,
          pdc_version: legalVersions.pdc,
        },
        client_session_id: sessionRef.current.sessionId,
        tunnel_started_at_ms: sessionRef.current.startedAtMs,
        hp_zip: '',
      };

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200 && (data.status === 'ok' || data.status === 'duplicate')) {
        trackEvent('lead_submitted', {
          campaign: data.campaign_id ?? 'unknown',
          dedup: data.status === 'duplicate' ? 'true' : 'false',
        });
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        router.push('/tunnel/confirmation');
        return;
      }
      if (res.status === 429) {
        setServerError('Trop de tentatives — merci de réessayer dans quelques minutes.');
      } else if (Array.isArray(data?.errors)) {
        setServerError(data.errors.map((e: { message: string }) => e.message).join(' · '));
      } else {
        setServerError('Une erreur est survenue. Merci de réessayer.');
      }
    } catch {
      setServerError('Erreur réseau. Merci de réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  // Honeypot — visually hidden, kept off the keyboard tab order.
  // Label intentionally non-descriptive so e2e tests can target real fields by name.
  const honeypotInput = (
    <div className="sr-only" aria-hidden="true">
      <label>
        Ne pas remplir
        <input type="text" tabIndex={-1} autoComplete="off" name="hp_zip" />
      </label>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Demande de devis mutuelle senior"
    >
      {honeypotInput}

      <AnimatePresence mode="wait">
      {step === 0 && (
        <FunnelLayout
          step={0}
          totalSteps={STEPS.length}
          stepKey={STEPS[step]}
          labels={STEP_LABELS}
          title="Quelle est votre date de naissance ?"
          subtitle="Nous l'utilisons pour vous proposer la meilleure offre."
        >
          <Input
            label="Date de naissance"
            type="date"
            {...register('date_naissance', {
              required: 'Champ obligatoire',
              validate: (v) => {
                if (!v) return 'Champ obligatoire';
                const a = computeAge(v);
                if (Number.isNaN(a)) return 'Date invalide';
                if (a < 0 || a > 120) return 'Date non plausible';
                return true;
              },
            })}
            error={errors.date_naissance?.message}
          />
          <NavButtons onNext={next} />
        </FunnelLayout>
      )}

      {step === 1 && (
        <FunnelLayout
          step={1}
          totalSteps={STEPS.length}
          stepKey={STEPS[step]}
          labels={STEP_LABELS}
          title="Quel est votre code postal ?"
          subtitle="Métropole et DOM uniquement (5 chiffres)."
        >
          <Input
            label="Code postal"
            type="text"
            inputMode="numeric"
            placeholder="75015"
            maxLength={5}
            {...register('code_postal', {
              required: 'Champ obligatoire',
              pattern: {
                value: /^(?:0[1-9]|[1-8]\d|9[0-5]|97)\d{3}$/,
                message: 'Code postal non éligible (métropole et DOM uniquement)',
              },
            })}
            error={errors.code_postal?.message}
          />
          <NavButtons onBack={back} onNext={next} />
        </FunnelLayout>
      )}

      {step === 2 && (
        <FunnelLayout
          step={2}
          totalSteps={STEPS.length}
          stepKey={STEPS[step]}
          labels={STEP_LABELS}
          title="Comment vous appelez-vous ?"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom"
              type="text"
              autoComplete="family-name"
              {...register('nom', { required: 'Champ obligatoire', maxLength: 80 })}
              error={errors.nom?.message}
            />
            <Input
              label="Prénom"
              type="text"
              autoComplete="given-name"
              {...register('prenom', { required: 'Champ obligatoire', maxLength: 80 })}
              error={errors.prenom?.message}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Email (facultatif)"
              type="email"
              autoComplete="email"
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email invalide',
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Téléphone (facultatif)"
              type="tel"
              autoComplete="tel"
              placeholder="06 12 34 56 78"
              {...register('telephone', {
                pattern: {
                  value: /^(?:\+33|0)[1-9](?:[\s.]?\d{2}){4}$/,
                  message: 'Téléphone invalide',
                },
              })}
              error={errors.telephone?.message}
            />
          </div>
          <NavButtons onBack={back} onNext={next} />
        </FunnelLayout>
      )}

      {step === 3 && (
        <FunnelLayout
          step={3}
          totalSteps={STEPS.length}
          stepKey={STEPS[step]}
          labels={STEP_LABELS}
          title={
            isUnder55
              ? 'Souhaitez-vous couvrir d’autres bénéficiaires ?'
              : 'Et votre entourage ?'
          }
          subtitle={
            isUnder55
              ? 'Cette information nous aide à vous proposer la formule la mieux adaptée. Elle est obligatoire pour les visiteurs de moins de 55 ans.'
              : 'Cette étape est facultative pour vous.'
          }
        >
          <FieldGroup legend="Conjoint à couvrir ?">
            <label className="flex items-center gap-3 text-base">
              <input
                type="radio"
                value="0"
                {...register('conjoint_present')}
                className="h-5 w-5"
              />
              Non
            </label>
            <label className="flex items-center gap-3 text-base">
              <input
                type="radio"
                value="1"
                {...register('conjoint_present')}
                className="h-5 w-5"
              />
              Oui
            </label>
          </FieldGroup>

          {watch('conjoint_present') === '1' && (
            <div className="mt-4 grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
              <Input
                label="Date de naissance du conjoint"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                {...register('conjoint_date_naissance')}
              />
              <Select
                label="Régime du conjoint"
                hint="Si différent du vôtre"
                {...register('conjoint_regime')}
                defaultValue=""
              >
                <option value="">— Comme le titulaire —</option>
                <option value="1">Régime général</option>
                <option value="2">Travailleur non salarié</option>
                <option value="3">Exploitant agricole</option>
                <option value="4">Alsace-Moselle</option>
                <option value="5">Salarié agricole</option>
              </Select>
            </div>
          )}

          <div className="mt-6">
            <FieldGroup legend="Enfants à couvrir">
              {enfantsArray.fields.length === 0 && (
                <p className="text-sm text-gray-600">Aucun enfant déclaré pour le moment.</p>
              )}
              {enfantsArray.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <Input
                    label={`Enfant ${index + 1} — date de naissance`}
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    {...register(`enfants.${index}.date_naissance`)}
                  />
                  <Select
                    label="Régime"
                    {...register(`enfants.${index}.regime`)}
                    defaultValue=""
                  >
                    <option value="">— Comme le titulaire —</option>
                    <option value="1">Régime général</option>
                    <option value="2">Travailleur non salarié</option>
                    <option value="3">Exploitant agricole</option>
                    <option value="4">Alsace-Moselle</option>
                    <option value="5">Salarié agricole</option>
                  </Select>
                  <button
                    type="button"
                    onClick={() => enfantsArray.remove(index)}
                    className="self-end rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    aria-label={`Retirer l'enfant ${index + 1}`}
                  >
                    Retirer
                  </button>
                </div>
              ))}
              {enfantsArray.fields.length < 6 && (
                <button
                  type="button"
                  onClick={() => enfantsArray.append({ date_naissance: '', regime: '' })}
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--color-brand)] bg-white px-4 py-2 text-base font-semibold text-[var(--color-brand)] hover:bg-blue-50"
                >
                  + Ajouter un enfant
                </button>
              )}
            </FieldGroup>
          </div>

          <NavButtons onBack={back} onNext={next} />
        </FunnelLayout>
      )}

      {step === 4 && (
        <FunnelLayout
          step={4}
          totalSteps={STEPS.length}
          stepKey={STEPS[step]}
          labels={STEP_LABELS}
          title="Quelques détails pour affiner votre devis (facultatif)"
          subtitle="Toutes ces questions sont optionnelles. Plus vous renseignez d'éléments, plus l'offre sera précise."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Régime de Sécurité sociale"
              hint="Facultatif"
              {...register('regime')}
              defaultValue=""
            >
              <option value="">— Non renseigné —</option>
              <option value="1">Régime général</option>
              <option value="2">Travailleur non salarié</option>
              <option value="3">Exploitant agricole</option>
              <option value="4">Alsace-Moselle</option>
              <option value="5">Salarié agricole</option>
            </Select>
            <Select
              label="Niveau de garantie souhaité"
              hint="Facultatif"
              {...register('niveau_garantie')}
              defaultValue=""
            >
              <option value="">— Sans préférence —</option>
              <option value="economique">Économique</option>
              <option value="equilibre">Équilibre</option>
              <option value="renforce">Renforcé</option>
              <option value="premium">Premium</option>
            </Select>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select
              label="Situation actuelle"
              hint="Facultatif"
              {...register('situation_actuelle')}
              defaultValue=""
            >
              <option value="">— Non renseignée —</option>
              <option value="aucune_mutuelle">Pas de mutuelle actuellement</option>
              <option value="mutuelle_actuelle">J&apos;ai déjà une mutuelle</option>
              <option value="prefere_ne_pas_dire">Je préfère ne pas répondre</option>
            </Select>
            <Input
              label="Date d'effet souhaitée"
              hint="Facultatif"
              type="date"
              {...register('date_effet_souhaitee')}
            />
          </div>
          <div className="mt-6">
            <NavButtons
              onBack={back}
              onNext={next}
              nextLabel="Continuer →"
            />
            <button
              type="button"
              onClick={() => {
                trackEvent('funnel_step_skipped', { step: 'optionnel' });
                setStep(5);
              }}
              className="mt-3 block w-full rounded-md py-2 text-center text-sm font-medium text-gray-600 underline hover:text-[var(--color-brand)]"
            >
              Passer cette étape
            </button>
          </div>
        </FunnelLayout>
      )}

      {step === 5 && (
        <FunnelLayout
          step={5}
          totalSteps={STEPS.length}
          stepKey={STEPS[step]}
          labels={STEP_LABELS}
          title="Plus qu'une étape !"
          subtitle="Merci de confirmer les éléments suivants pour finaliser votre demande."
        >
          <div className="flex flex-col gap-5">
            <Checkbox
              label={
                <span>
                  J&apos;accepte que mes données soient traitées par l&apos;éditeur du site pour
                  les besoins de cette demande de mutuelle (cf.{' '}
                  <a
                    href="/politique-de-confidentialite"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-[var(--color-brand)]"
                  >
                    Politique de confidentialité
                  </a>{' '}
                  v{legalVersions.pdc}).
                </span>
              }
              {...register('data_processing', {
                required: 'Champ obligatoire pour soumettre la demande',
              })}
              error={errors.data_processing?.message}
            />
            <Checkbox
              label={
                <span>
                  J&apos;accepte que mes données soient transmises aux courtiers en assurance
                  partenaires en vue de me proposer une offre de mutuelle (cf.{' '}
                  <a
                    href="/conditions-generales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-[var(--color-brand)]"
                  >
                    CGU
                  </a>{' '}
                  v{legalVersions.cgu}). <strong>— obligatoire pour soumettre.</strong>
                </span>
              }
              {...register('courtier_transmission', {
                required: 'Le consentement à la transmission est requis',
              })}
              error={errors.courtier_transmission?.message}
            />
          </div>

          {serverError && (
            <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">
              {serverError}
            </p>
          )}

          <NavButtons
            onBack={back}
            isFinal
            loading={submitting}
            nextDisabled={!getValues('courtier_transmission')}
          />
        </FunnelLayout>
      )}
      </AnimatePresence>
    </form>
  );
}
