import type { Metadata } from 'next';
import { LandingPage } from '@/components/content/LandingPage';
import { PRIMARY_LANDINGS } from '@/config/seo';

const config = PRIMARY_LANDINGS.find((p) => p.slug === 'mutuelle-senior')!;

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
          h2: 'Pourquoi une mutuelle spécifique pour les seniors ?',
          body: (
            <>
              <p>
                Les besoins de santé évoluent avec l’âge. Après 55 ans, on consulte plus souvent, on
                peut avoir besoin d’audioprothèses, de soins dentaires plus lourds, de séances de
                kinésithérapie, ou d’une prise en charge optique renforcée. La Sécurité sociale ne
                rembourse qu’une partie limitée de ces postes — d’où l’intérêt d’une mutuelle
                senior bien calibrée pour combler le reste à charge.
              </p>
              <p>
                Une mutuelle senior se distingue d’une mutuelle classique par des garanties
                spécifiquement renforcées : forfaits dentaires plus généreux (couronnes, implants),
                meilleure couverture optique, audioprothèses, hospitalisation, et parfois des
                services d’assistance à domicile. Elle peut aussi prévoir des plafonds adaptés sur
                des postes moins prioritaires (orthodontie, maternité…) afin de maîtriser le tarif.
              </p>
            </>
          ),
        },
        {
          h2: 'Quels critères regarder en priorité ?',
          body: (
            <ul>
              <li>
                <strong>Le rapport garanties / prix</strong> — un tarif bas avec des plafonds
                ridicules ne sert à rien : regardez le 100 % santé dentaire et optique, les
                forfaits implants, les remboursements en pourcentage du tarif Sécu (BR ou BRSS).
              </li>
              <li>
                <strong>Les délais de carence</strong> — certaines offres imposent 3 à 9 mois avant
                les premières prises en charge. Évitez-les si vous avez des soins prévus à court
                terme.
              </li>
              <li>
                <strong>L’absence de questionnaire médical</strong> — beaucoup de mutuelles seniors
                modernes y renoncent, ce qui simplifie la souscription.
              </li>
              <li>
                <strong>Le tiers payant</strong> élargi (pharmacie, hôpital, dentiste) pour ne pas
                avancer les frais.
              </li>
              <li>
                <strong>L’assistance santé</strong> (aide-ménagère après hospitalisation, garde
                d’animaux, livraison de médicaments) qui prend tout son sens à la retraite.
              </li>
            </ul>
          ),
        },
        {
          h2: 'Comment fonctionne notre mise en relation ?',
          body: (
            <>
              <p>
                Vous répondez à quelques questions sur votre profil (date de naissance, code postal,
                composition familiale). Nos courtiers en assurance partenaires reçoivent ces
                informations — uniquement avec votre consentement explicite — et vous recontactent
                avec les meilleures offres correspondant à votre situation.
              </p>
              <p>
                Le service est <strong>100 % gratuit</strong>, <strong>sans engagement</strong>{' '}
                et vous gardez la main : vous comparez, vous décidez, vous choisissez ou vous
                refusez. Aucune souscription automatique n’est faite à votre place.
              </p>
            </>
          ),
        },
      ]}
      faqs={[
        {
          question: 'À partir de quel âge une mutuelle est-elle considérée comme « senior » ?',
          answer:
            'Le seuil habituel se situe à 55 ans, mais certaines compagnies proposent des offres seniors dès 50 ans, et d’autres démarrent à 60 ou 65 ans. L’important n’est pas l’étiquette mais l’adéquation des garanties à vos besoins réels.',
        },
        {
          question: 'Est-ce vrai qu’une mutuelle senior coûte plus cher ?',
          answer:
            'En moyenne oui, car la fréquence des soins augmente avec l’âge. Mais l’écart se justifie surtout pour les postes coûteux (dentaire, optique, hospitalisation). Comparer plusieurs offres permet souvent d’économiser 200 à 400 € par an à garanties équivalentes.',
        },
        {
          question: 'Puis-je changer de mutuelle senior à tout moment ?',
          answer:
            'Oui, depuis la loi du 14 juillet 2019, vous pouvez résilier votre mutuelle à tout moment après un an d’engagement, sans frais ni justification. C’est rapide : votre nouvelle mutuelle s’occupe en général des démarches.',
        },
        {
          question: 'Y a-t-il un questionnaire médical ?',
          answer:
            'De plus en plus de mutuelles seniors n’en demandent pas, ce qui simplifie l’adhésion et garantit l’égalité de traitement quel que soit votre état de santé. Nous orientons en priorité vers ces formules.',
        },
      ]}
    />
  );
}
