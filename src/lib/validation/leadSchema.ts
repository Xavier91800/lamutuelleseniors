import { z } from 'zod';
import { ACCEPTED_POSTAL_CODE_REGEX } from './postalCode';
import { computeAge, SENIOR_AGE_THRESHOLD } from '@/lib/campaign/resolveCampaign';

const namePart = z
  .string()
  .min(1, 'Champ obligatoire')
  .max(80, 'Trop long')
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, 'Champ obligatoire');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide');

const dateNaissanceSchema = isoDate.refine(
  (value) => {
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return false;
    if (dob.getTime() > Date.now()) return false;
    const age = computeAge(value);
    return age >= 0 && age <= 120;
  },
  'Date de naissance non plausible'
);

const codePostalSchema = z
  .string()
  .regex(ACCEPTED_POSTAL_CODE_REGEX, "Code postal non éligible (métropole et DOM uniquement)");

const phoneSchema = z
  .string()
  .regex(/^(?:\+33|0)[1-9]\d{8}$/, 'Téléphone invalide');

const emailSchema = z.string().email('Email invalide');

const consentSchema = z.object({
  data_processing: z.boolean(),
  courtier_transmission: z.literal(true, {
    message: 'Consentement à la transmission requis',
  }),
  cgu_version: z.string().min(1),
  pdc_version: z.string().min(1),
});

export const leadRequestSchema = z
  .object({
    nom: namePart,
    prenom: namePart,
    date_naissance: dateNaissanceSchema,
    code_postal: codePostalSchema,
    email: emailSchema.optional(),
    telephone: phoneSchema.optional(),

    // Optional enrichment (FR-012)
    regime: z.number().int().optional(),
    niveau_garantie: z
      .enum(['economique', 'equilibre', 'renforce', 'premium'])
      .optional(),
    situation_actuelle: z
      .enum(['aucune_mutuelle', 'mutuelle_actuelle', 'prefere_ne_pas_dire'])
      .optional(),
    date_effet_souhaitee: isoDate.optional(),

    // Family composition (conditionally required for under-55, see superRefine)
    conjoint_present: z.union([z.literal(0), z.literal(1)]).optional(),
    conjoint_date_naissance: isoDate.optional(),
    conjoint_regime: z.number().int().optional(),
    enfants_dates_naissance: z.array(isoDate).max(6).optional(),
    enfants_regimes: z.array(z.number().int()).max(6).optional(),

    consent: consentSchema,

    client_session_id: z.string().min(1),
    tunnel_started_at_ms: z.number().int().nonnegative(),
    hp_zip: z.string().optional().default(''),

    source_path: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const age = computeAge(data.date_naissance);
    if (age < SENIOR_AGE_THRESHOLD) {
      if (data.conjoint_present === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['conjoint_present'],
          message: 'Champ requis pour les visiteurs de moins de 55 ans',
        });
      }
      if (data.enfants_dates_naissance === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['enfants_dates_naissance'],
          message: 'Champ requis pour les visiteurs de moins de 55 ans',
        });
      }
    }
    if (data.conjoint_present === 1 && !data.conjoint_date_naissance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['conjoint_date_naissance'],
        message: 'Date de naissance du conjoint requise',
      });
    }
    if (
      data.enfants_regimes &&
      data.enfants_dates_naissance &&
      data.enfants_regimes.length !== data.enfants_dates_naissance.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['enfants_regimes'],
        message: 'Longueur de enfants_regimes doit correspondre à enfants_dates_naissance',
      });
    }
  });

export type LeadRequest = z.infer<typeof leadRequestSchema>;
