import type { Metadata } from 'next';
import { LandingPage } from '@/components/content/LandingPage';
import { PRIMARY_LANDINGS } from '@/config/seo';

const config = PRIMARY_LANDINGS.find((p) => p.slug === 'comparatif-mutuelle-sante')!;

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
          h2: 'Comparer une mutuelle santé : pourquoi est-ce si difficile ?',
          body: (
            <p>
              Plus de 400 acteurs proposent une mutuelle santé en France, avec chacun sa grille
              tarifaire, ses paliers de garanties et ses options. Le langage technique (BR, BRSS,
              FR, PMSS) rajoute une couche de complexité. Notre rôle est de simplifier ce
              comparatif en traduisant les garanties en remboursements réels, sur les postes qui
              comptent vraiment pour vous.
            </p>
          ),
        },
        {
          h2: 'La grille de comparaison à utiliser',
          body: (
            <ul>
              <li>
                <strong>Consultations généraliste / spécialiste</strong> — important si vous avez
                un médecin traitant en secteur 2.
              </li>
              <li>
                <strong>Hospitalisation</strong> — chambre particulière, frais d’accompagnement,
                forfait journalier.
              </li>
              <li>
                <strong>Dentaire</strong> — couronnes, implants, orthodontie. Vérifier les
                plafonds annuels en euros.
              </li>
              <li>
                <strong>Optique</strong> — verres complexes, lentilles, fréquence de
                renouvellement.
              </li>
              <li>
                <strong>Médecines douces</strong> — ostéopathie, acupuncture, naturopathie : forfait
                annuel et nombre de séances.
              </li>
              <li>
                <strong>Pharmacie</strong> — automédication, vaccins, vitamines.
              </li>
            </ul>
          ),
        },
        {
          h2: 'Comment notre service vous fait gagner du temps',
          body: (
            <p>
              Plutôt que de remplir 10 formulaires sur 10 sites différents, vous remplissez le nôtre
              une fois, en deux minutes. Nos courtiers partenaires reçoivent votre profil, en font
              une lecture experte et reviennent vers vous avec des propositions ciblées. Vous
              gardez la main jusqu’à la signature.
            </p>
          ),
        },
      ]}
      faqs={[
        {
          question: 'Puis-je résilier ma mutuelle actuelle facilement ?',
          answer:
            'Oui : depuis la loi du 14 juillet 2019, vous pouvez résilier à tout moment après un an d’engagement, sans frais. La nouvelle mutuelle s’occupe en général des démarches.',
        },
        {
          question: 'Le 100 % santé est-il dans toutes les offres ?',
          answer:
            'Oui, c’est obligatoire pour toute mutuelle dite « responsable ». Il couvre un panier de soins zéro reste à charge sur le dentaire, l’optique et l’audio. Au-delà, les niveaux varient.',
        },
      ]}
    />
  );
}
