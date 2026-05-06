import type { Metadata } from 'next';
import { LandingPage } from '@/components/content/LandingPage';
import { PRIMARY_LANDINGS } from '@/config/seo';

const config = PRIMARY_LANDINGS.find((p) => p.slug === 'comparatif-mutuelle-senior')!;

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
          h2: 'Pourquoi un comparatif est utile pour une mutuelle senior',
          body: (
            <p>
              Les écarts de tarifs entre deux mutuelles seniors aux garanties équivalentes peuvent
              dépasser <strong>40&nbsp;%</strong>. À 60 ans et plus, cela représente plusieurs
              centaines d’euros par an. Un comparatif sérieux ne se limite pas au prix : il évalue
              les remboursements réels (et pas seulement les pourcentages affichés), les délais de
              carence, la qualité du service client et les services associés.
            </p>
          ),
        },
        {
          h2: 'Les critères clés pour comparer',
          body: (
            <ul>
              <li>
                <strong>Tarif mensuel</strong> et son évolution prévue — certaines mutuelles
                augmentent fortement à 70 ans.
              </li>
              <li>
                <strong>Plafonds dentaire et optique</strong> — exprimez-les en euros réels (ex.
                « 800 € par an pour les implants ») et non en pourcentage abstrait.
              </li>
              <li>
                <strong>Délai de carence</strong> — l’absence de carence est précieuse si vous
                souhaitez démarrer rapidement.
              </li>
              <li>
                <strong>Médecine douce et hospitalisation</strong> — souvent négligés mais utiles
                aux seniors.
              </li>
              <li>
                <strong>Tiers payant et services en ligne</strong> — espace adhérent ergonomique,
                application mobile, télémédecine.
              </li>
            </ul>
          ),
        },
        {
          h2: 'Notre démarche : un comparatif personnalisé',
          body: (
            <p>
              Plutôt qu’un classement générique, nous transmettons votre profil à des courtiers en
              assurance partenaires qui vous proposent les offres les plus pertinentes pour vous.
              Vous comparez ensuite des propositions réellement adaptées à votre âge, votre code
              postal et votre composition familiale — pas une moyenne marketing.
            </p>
          ),
        },
      ]}
      faqs={[
        {
          question: 'Combien d’offres vais-je recevoir ?',
          answer:
            'En général deux à quatre offres, sélectionnées parmi les plus compétitives de nos courtiers partenaires sur votre département. Vous restez libre de toutes les refuser.',
        },
        {
          question: 'Le comparatif est-il vraiment indépendant&nbsp;?',
          answer:
            'Notre rémunération provient des courtiers partenaires lorsque vous souscrivez via eux. Nous n’avons aucun intérêt à vous orienter vers une formule plus chère que nécessaire — au contraire, un client satisfait revient et nous recommande.',
        },
        {
          question: 'Combien de temps cela prend-il&nbsp;?',
          answer:
            'Deux minutes pour répondre à nos questions, et 24 à 72 h pour recevoir les premières propositions de la part des courtiers.',
        },
      ]}
    />
  );
}
