-- ============================================================
-- Rimozione login via email: si torna all'accesso con la chiave dell'app
-- (protetto dal codice nell'app). Ripristina le regole "aperte" sui dati
-- personali, così l'app legge/scrive senza login email.
-- Da incollare nel SQL Editor e cliccare Run. Rieseguibile.
-- ============================================================

-- day_log
drop policy if exists "owner day_log" on day_log;
drop policy if exists "rw day_log" on day_log;
create policy "rw day_log" on day_log for all using (true) with check (true);

-- exercise_log
drop policy if exists "owner exercise_log" on exercise_log;
drop policy if exists "rw exercise_log" on exercise_log;
create policy "rw exercise_log" on exercise_log for all using (true) with check (true);

-- week_checkin
drop policy if exists "owner week_checkin" on week_checkin;
drop policy if exists "rw week_checkin" on week_checkin;
create policy "rw week_checkin" on week_checkin for all using (true) with check (true);

-- trip_config
drop policy if exists "owner trip_config" on trip_config;
drop policy if exists "rw trip_config" on trip_config;
create policy "rw trip_config" on trip_config for all using (true) with check (true);

-- bia_scan
drop policy if exists "owner bia_scan" on bia_scan;
drop policy if exists "rw bia_scan" on bia_scan;
create policy "rw bia_scan" on bia_scan for all using (true) with check (true);

-- goal_phase
drop policy if exists "owner goal_phase" on goal_phase;
drop policy if exists "rw goal_phase" on goal_phase;
create policy "rw goal_phase" on goal_phase for all using (true) with check (true);
