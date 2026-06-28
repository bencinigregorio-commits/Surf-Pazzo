-- ============================================================
-- SICUREZZA — Accesso ai dati personali solo per la tua email
-- Sostituisce le regole "aperte" con regole legate al login.
-- Solo chi è entrato con bencinigregorio@gmail.com può leggere/scrivere.
-- Le tabelle di "contenuto" (esercizi, sedute, alternative) restano in
-- sola lettura pubblica: non sono dati personali.
-- Da incollare nel SQL Editor e cliccare Run. Rieseguibile.
-- ============================================================

-- day_log
drop policy if exists "rw day_log" on day_log;
drop policy if exists "owner day_log" on day_log;
create policy "owner day_log" on day_log for all
  using ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com');

-- exercise_log
drop policy if exists "rw exercise_log" on exercise_log;
drop policy if exists "owner exercise_log" on exercise_log;
create policy "owner exercise_log" on exercise_log for all
  using ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com');

-- week_checkin
drop policy if exists "rw week_checkin" on week_checkin;
drop policy if exists "owner week_checkin" on week_checkin;
create policy "owner week_checkin" on week_checkin for all
  using ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com');

-- trip_config
drop policy if exists "rw trip_config" on trip_config;
drop policy if exists "owner trip_config" on trip_config;
create policy "owner trip_config" on trip_config for all
  using ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com');

-- bia_scan
drop policy if exists "rw bia_scan" on bia_scan;
drop policy if exists "owner bia_scan" on bia_scan;
create policy "owner bia_scan" on bia_scan for all
  using ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com');

-- goal_phase
drop policy if exists "rw goal_phase" on goal_phase;
drop policy if exists "owner goal_phase" on goal_phase;
create policy "owner goal_phase" on goal_phase for all
  using ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'bencinigregorio@gmail.com');
