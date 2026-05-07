import type { Metadata } from 'next';
import { LandingPage } from '@/components/content/LandingPage';
import { PRIMARY_LANDINGS } from '@/config/seo';

const config = PRIMARY_LANDINGS.find((p) => p.slug === 'devis-mutuelle-senior')!;

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: { canonical: `/${config.slug}` },
  openGraph: { title: config.title, description: config.description, url: `/${config.slug}` },
};

export default function Page() {
  return (
    <LandingPage
      config={config}
      sections={[
        {
          h2: 'Comment obtenir un devis mutuelle senior fiable ?',
          body: (
            <p>
              Un devis fiable nécessite un minimum d’informations : votre date de naissance (le
              tarif évolue avec l’âge), votre code postal (les tarifs sont régionalisés), et la
              composition familiale à couvrir. Avec ces données, un courtier peut vous proposer en
              24 à 72 h plusieurs offres précises, contractuellement valides.
            </p>
          ),
        },
        {
          h2: 'Ce qu’il faut éviter',
          body: (
            <ul>
              <li>
                <strong>Les estimations en ligne « instantanées »</strong> qui ne demandent que
                l’âge — elles donnent une fourchette, jamais un tarif réellement souscriptible.
              </li>
              <li>
                <strong>Les devis qui exigent immédiatement vos coordonnées bancaires</strong> —
                aucun acteur sérieux ne demande un RIB avant que vous ayez accepté une offre.
              </li>
              <li>
                <strong>Les offres « miracles » à 9,90 €/mois</strong> — vérifiez le tableau de
                garanties : couverture quasi nulle au-delà du panier 100 % santé.
              </li>
            </ul>
          ),
        },
        {
          h2: 'Notre engagement',
          body: (
            <p>
              Le devis est <strong>gratuit</strong>, <strong>sans engagement</strong>, et nous ne
              transmettons votre demande qu’après votre <strong>consentement explicite</strong>.
              Vous décidez ensuite des suites, à votre rythme.
            </p>
          ),
        },
      ]}
      faqs={[
        {
          question: 'Le devis est-il contractuel ?',
          answer:
            'Oui — un devis émis par un courtier engage l’assureur sur les garanties et le tarif annoncés, généralement pendant 30 jours, à condition que vos déclarations soient exactes.',
        },
        {
          question: 'Puis-je demander plusieurs devis pour comparer ?',
          answer:
            'C’est précisément le but de notre service : un seul formulaire, plusieurs devis adaptés à votre profil.',
        },
      ]}
    />
  );
}
