-- 0007_insured_over_one_year.sql
-- Capture si le visiteur déjà couvert par une mutuelle l'est depuis plus d'un an.
-- Cette information est exigée par le partenaire CRMLeads dès lors que
-- mutuelle.currentlyInsured = true ; sans elle, le bloc mutuelle est omis,
-- et le courtier perd la donnée de droit à résiliation infra-annuelle.
--
-- 0/1 = non/oui ; NULL = non renseigné ("je ne sais pas") → on continue à omettre
-- le bloc mutuelle dans ce cas plutôt que d'envoyer une donnée fabriquée.

ALTER TABLE leads ADD COLUMN insured_over_one_year INTEGER;
