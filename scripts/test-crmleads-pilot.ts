/**
 * Pilote CRMLeads — pousse un lead de test via HttpLeadDeliveryClient.
 *
 * Usage :
 *   set -a; . .env; set +a
 *   npx tsx scripts/test-crmleads-pilot.ts [--campaign senior|under55_family|under55_solo]
 *
 * Le payload est délibérément reconnaissable (nom: PILOTE, prenom: TEST-CRMLEADS,
 * email/téléphone marqueurs) pour pouvoir le filtrer et le supprimer côté admin.
 */

import { HttpLeadDeliveryClient } from '../src/lib/lead-delivery/HttpLeadDeliveryClient';
import type {
  LeadDeliveryPayload,
  DeliveryResult,
} from '../src/lib/lead-delivery/LeadDeliveryClient';
import type { CampaignId } from '../src/types/lead';

function parseCampaign(): CampaignId {
  const idx = process.argv.indexOf('--campaign');
  const v = idx >= 0 ? process.argv[idx + 1] : 'senior';
  if (v === 'senior' || v === 'under55_family' || v === 'under55_solo') return v;
  throw new Error(`unknown campaign: ${v}`);
}

const campaign = parseCampaign();
const dobByCampaign: Record<CampaignId, string> = {
  senior: '1960-01-15',
  under55_family: '1985-06-01',
  under55_solo: '1992-03-20',
};

const nowIso = new Date().toISOString();
const leadId = `pilot_${campaign}_${Date.now()}`;

const payload: LeadDeliveryPayload = {
  lead_id: leadId,
  campaign_id: campaign,
  submitted_at: nowIso,
  identity: {
    nom: 'PILOTE',
    prenom: 'TEST-CRMLEADS',
    date_naissance: dobByCampaign[campaign],
    code_postal: '75001',
    email: 'xavier+crmleads-pilot@qolop.sarl',
    telephone: '0600000000',
  },
  qualifications: {
    regime: 1,
    ...(campaign === 'under55_family' && {
      conjoint: { date_naissance: '1987-09-15' },
      enfants_dates_naissance: ['2018-01-20'],
    }),
  },
  consent: {
    granted_at: nowIso,
    cgu_version: '1.1',
    pdc_version: '1.2',
    ip_address: '127.0.0.1',
    user_agent: 'crmleads-pilot-script',
  },
};

console.log('— Pilote CRMLeads —');
console.log(`  campaign       : ${campaign}`);
console.log(`  lead_id (local): ${leadId}`);
console.log(`  base url       : ${process.env.LEAD_DELIVERY_API_BASE_URL ?? 'https://leads.vos2vis.net/api'}`);
console.log('');

async function main(): Promise<void> {
  const client = HttpLeadDeliveryClient.fromEnv();

  const start = Date.now();
  const result: DeliveryResult = await client.deliver(payload);
  const elapsedMs = Date.now() - start;

  console.log(`  HTTP round-trip: ${elapsedMs} ms`);
  console.log(`  result         : ${JSON.stringify(result, null, 2)}`);

  if (result.status === 'success') {
    console.log('');
    console.log(`OK  Pilote reussi. provider_id = ${result.provider_id ?? '(missing)'}`);
    console.log('    Verifie cote CRMLeads admin que le lead apparait avec :');
    console.log(`    - nom/prenom : PILOTE / TEST-CRMLEADS`);
    console.log(`    - email      : xavier+crmleads-pilot@qolop.sarl`);
    console.log(`    - campagne   : ${campaign}`);
    process.exit(0);
  } else {
    console.error('');
    console.error(`KO  Pilote en echec : status=${result.status} reason=${'reason' in result ? result.reason : '?'}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Pilote: erreur inattendue', err);
  process.exit(2);
});
