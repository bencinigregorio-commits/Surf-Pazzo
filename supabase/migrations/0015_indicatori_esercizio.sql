-- ============================================================
-- Indicatori giusti per tipo di esercizio
-- Aggiunge durata, distanza e variante ai log dei singoli esercizi,
-- così resistenza (vogatore/corda) e tecnica (pop-up/balance) non
-- devono più usare il campo "carico".
-- Additivo, rieseguibile. Da incollare nel SQL Editor e cliccare Run.
-- ============================================================

alter table exercise_log add column if not exists duration_min numeric;  -- durata (minuti)
alter table exercise_log add column if not exists distance_m   numeric;  -- distanza (metri)
alter table exercise_log add column if not exists variant      text;     -- variante / livello (es. balance liv. 3)
