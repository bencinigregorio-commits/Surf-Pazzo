-- ============================================================
-- Permessi di MODIFICA del programma (esercizi, sedute, alternative)
-- Finora queste tabelle erano in sola lettura; ora l'app (protetta dal
-- codice) può anche modificarle: aggiungere/cambiare/rimuovere esercizi.
-- Da incollare nel SQL Editor e cliccare Run. Rieseguibile.
-- ============================================================

-- exercise
drop policy if exists "scrittura esercizi" on exercise;
create policy "scrittura esercizi" on exercise for all using (true) with check (true);

-- session_exercise (legame seduta-esercizio)
drop policy if exists "scrittura legami" on session_exercise;
create policy "scrittura legami" on session_exercise for all using (true) with check (true);

-- session_template (sedute)
drop policy if exists "scrittura sedute" on session_template;
create policy "scrittura sedute" on session_template for all using (true) with check (true);

-- exercise_alternative (alternative)
drop policy if exists "scrittura alternative" on exercise_alternative;
create policy "scrittura alternative" on exercise_alternative for all using (true) with check (true);
