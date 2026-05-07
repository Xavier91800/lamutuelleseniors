import type { Metadata } from 'next';
import { LandingPage } from '@/components/content/LandingPage';
import { PRIMARY_LANDINGS } from '@/config/seo';

const config = PRIMARY_LANDINGS.find((p) => p.slug === 'meilleure-mutuelle-senior')!;

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
          h2: 'La meilleure mutuelle senior : un choix forcément personnel',
          body: (
            <p>
              Aucune mutuelle ne peut être universellement « la meilleure » : tout dépend de votre
              profil. Une excellente mutuelle pour un senior actif de 58 ans en bonne santé peut
              être inadaptée à un retraité de 75 ans suivi pour plusieurs pathologies. Notre rôle
              est d’identifier <em>votre</em> meilleure mutuelle, en croisant vos besoins, votre
              budget et les offres compétitives du marché.
            </p>
          ),
        },
        {
          h2: 'Les vrais critères de qualité',
          body: (
            <ul>
              <li>
                <strong>La solidité financière</strong> de l’assureur — un acteur reconnu (mutualiste
                ou compagnie majeure) limite les surprises tarifaires sur la durée.
              </li>
              <li>
                <strong>La transparence des plafonds</strong> — fuyez les contrats où le détail des
                garanties tient sur trois lignes vagues.
              </li>
              <li>
                <strong>La qualité du service client</strong> — joignable, rapide, francophone, avec
                un espace adhérent ergonomique. Les avis Trustpilot ou Google donnent de bons
                signaux.
              </li>
              <li>
                <strong>L’accompagnement spécifique senior</strong> — assistance à domicile, prise
                en charge psychologique, téléconsultation incluse, prévention.
              </li>
              <li>
                <strong>L’absence de pièges</strong> : pas de questionnaire médical excluant les
                pathologies préexistantes, pas de hausse abusive de tarif après 70 ans.
              </li>
            </ul>
          ),
        },
        {
          h2: 'Pourquoi passer par un comparateur indépendant ?',
          body: (
            <p>
              Comparer 5 ou 6 acteurs sur leur site officiel, c’est plusieurs heures de travail. Et
              les meilleures offres ne sont pas toujours visibles publiquement : les courtiers
              négocient des conditions préférentielles avec les assureurs, parfois invisibles aux
              particuliers. En passant par notre service, vous accédez à ces conditions, gratuitement
              et sans engagement.
            </p>
          ),
        },
      ]}
      faqs={[
        {
          question: 'Existe-t-il un classement officiel des meilleures mutuelles seniors ?',
          answer:
            'Non, pas de classement officiel ; en revanche, des organismes comme l’ACPR publient des données de solvabilité, et des médias spécialisés (Que Choisir, 60 Millions de consommateurs) mènent des enquêtes annuelles. Un comparatif individualisé reste la meilleure approche.',
        },
        {
          question: 'Mon état de santé peut-il être un frein ?',
          answer:
            'De moins en moins. Beaucoup de mutuelles seniors ne demandent plus de questionnaire médical. Notre service oriente en priorité vers ces formules.',
        },
      ]}
    />
  );
}
