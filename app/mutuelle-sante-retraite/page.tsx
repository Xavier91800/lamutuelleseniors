import type { Metadata } from 'next';
import { LandingPage } from '@/components/content/LandingPage';
import { PRIMARY_LANDINGS } from '@/config/seo';

const config = PRIMARY_LANDINGS.find((p) => p.slug === 'mutuelle-sante-retraite')!;

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
          h2: 'Le passage à la retraite : un moment clé pour sa mutuelle',
          body: (
            <p>
              Au moment du départ à la retraite, la mutuelle d’entreprise prend fin. Vous pouvez
              prolonger temporairement la couverture (loi Évin), mais les tarifs grimpent souvent
              de 50 % à 100 % sur 3 ans. Souscrire une mutuelle santé individuelle, dès
              que vous connaissez votre date de départ, est en général plus avantageux à moyen
              terme.
            </p>
          ),
        },
        {
          h2: 'Ce qui change à la retraite',
          body: (
            <ul>
              <li>
                <strong>Plus de cotisations partagées</strong> avec l’employeur : la totalité du
                tarif est à votre charge.
              </li>
              <li>
                <strong>Profil de soins différent</strong> : moins de besoins liés au travail (vue
                au bureau, troubles musculo-squelettiques), plus de besoins liés à l’âge
                (audioprothèses, soins dentaires lourds, kinésithérapie).
              </li>
              <li>
                <strong>Mobilité géographique</strong> : un déménagement vers une région plus calme
                modifie souvent la grille tarifaire (Paris coûte plus cher que la Bretagne).
              </li>
            </ul>
          ),
        },
        {
          h2: 'Choisir sa mutuelle santé retraité en 5 points',
          body: (
            <ol>
              <li>Faire un bilan de ses besoins réels — pas ses besoins de salarié.</li>
              <li>
                Vérifier l’absence de questionnaire médical pour ne pas être pénalisé sur les
                pathologies préexistantes.
              </li>
              <li>Privilégier les contrats <strong>responsables</strong> qui incluent le 100 % santé.</li>
              <li>
                Comparer le tarif à 65, 70 et 75 ans (certains contrats explosent après 70 ans).
              </li>
              <li>
                Lire les clauses d’assistance — utiles en cas d’hospitalisation ou de besoin de
                soins à domicile.
              </li>
            </ol>
          ),
        },
      ]}
      faqs={[
        {
          question: 'Puis-je garder ma mutuelle d’entreprise après la retraite ?',
          answer:
            'Oui, via la loi Évin, mais à un tarif majoré (et plafonné les 3 premières années à +50 %). Comparer avec une offre individuelle est presque toujours rentable.',
        },
        {
          question: 'À quel âge dois-je penser à changer de mutuelle ?',
          answer:
            'Idéalement 6 à 12 mois avant le départ à la retraite, pour souscrire en bonne santé et anticiper l’arrêt de la couverture employeur.',
        },
      ]}
    />
  );
}
