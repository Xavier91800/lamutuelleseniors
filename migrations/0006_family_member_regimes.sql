-- 0006_family_member_regimes.sql
-- Capture le régime social du conjoint et des enfants en plus de leur date de naissance.
-- Avant cette migration, le tunnel ne demandait que "oui/non" et un compte d'enfants ;
-- les dates étaient bidonnées et le régime supposé identique à celui du titulaire.

ALTER TABLE leads ADD COLUMN conjoint_regime INTEGER;
ALTER TABLE leads ADD COLUMN enfants_regimes TEXT; -- JSON array, parallèle à enfants_dates_naissance
