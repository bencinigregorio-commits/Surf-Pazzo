-- ============================================================
-- BIA: aggiunge la Massa Muscolare Scheletrica (Skeletal Muscle Mass)
-- Sostituisce, tra gli essenziali mostrati, l'angolo di fase (assente su Evolt).
-- Additivo, rieseguibile. Da incollare nel SQL Editor e cliccare Run.
-- ============================================================

alter table bia_scan add column if not exists smm numeric;  -- massa muscolare scheletrica (kg)
