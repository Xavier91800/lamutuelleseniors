import type { Metadata } from 'next';
import { LandingPage } from '@/components/content/LandingPage';
import { PRIMARY_LANDINGS } from '@/config/seo';

const config = PRIMARY_LANDINGS.find((p) => p.slug === 'mutuelle-sante')!;

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
          h2: 'Pourquoi une mutuelle santé est-elle quasiment indispensable ?',
          body: (
            <>
              <p>
                La Sécurité sociale rembourse une partie de vos dépenses de santé, mais le « ticket
                modérateur » et les dépassements d’honoraires restent à votre charge. Sans
                complémentaire, une simple paire de lunettes peut coûter 300 € de votre poche, une
                consultation chez un spécialiste 25 €, et une hospitalisation plusieurs centaines
                d’euros.
              </p>
              <p>
                Une mutuelle santé prend en charge tout ou partie de ce reste à charge, selon le
                niveau de garanties souscrit. Bien choisie, elle évite les renoncements aux soins
                et fluidifie la vie quotidienne grâce au tiers payant.
              </p>
            </>
          ),
        },
        {
          h2: 'Les 4 niveaux de garanties à connaître',
          body: (
            <ul>
              <li>
                <strong>Économique</strong> — couvre l’essentiel (consultations, pharmacie,
                hospitalisation à 100 % du tarif Sécu). Pour les budgets serrés ou les profils
                en bonne santé.
              </li>
              <li>
                <strong>Équilibre</strong> — bonne couverture sur tous les postes courants, dont le
                dentaire et l’optique de base. Le meilleur rapport qualité/prix pour la majorité.
              </li>
              <li>
                <strong>Renforcé</strong> — augmente les remboursements sur les postes coûteux
                (implants, prothèses dentaires, optique progressive, audioprothèses).
              </li>
              <li>
                <strong>Premium</strong> — couverture maximale, ticket modérateur quasi nul,
                médecines douces (ostéopathie, acupuncture), forfaits luxes. Pour les profils
                exigeants ou les besoins lourds anticipés.
              </li>
            </ul>
          ),
        },
        {
          h2: 'Quelles questions vous poser avant de choisir ?',
          body: (
            <>
              <p>
                <strong>Quels sont mes postes prioritaires ?</strong> Dentaire, optique,
                hospitalisation, médecines douces, audioprothèses : la mutuelle idéale n’est pas la
                plus chère, c’est celle qui couvre le mieux ce dont vous avez réellement besoin.
              </p>
              <p>
                <strong>Quel est mon budget mensuel raisonnable ?</strong> Comptez en général
                40 à 80 € pour une formule équilibrée à 30 ans, 90 à 150 € pour un senior avec
                couverture complète. Au-delà, vérifiez que les garanties supplémentaires sont
                vraiment utilisées.
              </p>
              <p>
                <strong>Ai-je besoin d’une couverture famille ?</strong> Beaucoup de contrats
                proposent des tarifs dégressifs à partir du conjoint et des enfants — souvent
                gratuits dès le 3ᵉ enfant.
              </p>
            </>
          ),
        },
      ]}
      faqs={[
        {
          question: 'Comment lire les garanties exprimées en pourcentage ?',
          answer:
            'Un remboursement à 100 % signifie 100 % du tarif de convention de la Sécurité sociale (BR/BRSS), pas 100 % de ce que vous payez. À 200 %, votre mutuelle complète jusqu’à deux fois le tarif Sécu, ce qui couvre la plupart des dépassements modérés.',
        },
        {
          question: 'Faut-il garder sa mutuelle d’entreprise quand on devient indépendant ?',
          answer:
            'Vous bénéficiez de la portabilité gratuite jusqu’à 12 mois après la sortie de l’entreprise. Au-delà, comparez : une mutuelle individuelle bien choisie coûte souvent moins cher que la prolongation de la collective.',
        },
        {
          question: 'Le 100 % santé est-il automatique ?',
          answer:
            'Oui, toutes les mutuelles « responsables » l’incluent obligatoirement sur le dentaire, l’optique et l’audio. Cela ne couvre pas tout, mais garantit un panier de soins sans reste à charge.',
        },
      ]}
    />
  );
}
