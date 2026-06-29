-- ============================================================
-- PULIZIA DATI DI PROVA
-- Svuota i dati personali inseriti durante i test (log, check-in, BIA,
-- viaggio, fase). NON tocca esercizi, sedute A/B/C e alternative: quelli
-- sono il tuo programma e restano.
-- Da incollare nel SQL Editor e cliccare Run.
-- ============================================================

delete from exercise_log;   -- esercizi registrati nelle sedute di prova
delete from day_log;        -- sedute/attività registrate
delete from week_checkin;   -- check-in fatica (fresco/ok/cotto)
delete from bia_scan;       -- scansioni BIA di prova

-- Fase obiettivo: riporta a "mantenimento" pulito
delete from goal_phase;
insert into goal_phase (phase) values ('mantenimento');

-- Viaggio: nessuno impostato
update trip_config set trip_date = null where id = 1;
