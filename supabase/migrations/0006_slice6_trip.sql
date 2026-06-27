-- ============================================================
-- FETTA 6 — Modalità pre-trip (data del viaggio)
-- Una singola riga di configurazione con la data del prossimo viaggio.
-- NON tocca dati esistenti. Rieseguibile.
-- ============================================================

create table if not exists trip_config (
  id        int primary key default 1,
  trip_date date,
  check (id = 1)
);

-- Assicura che esista la riga singola di configurazione.
insert into trip_config (id, trip_date) values (1, null)
on conflict (id) do nothing;

alter table trip_config enable row level security;
drop policy if exists "rw trip_config" on trip_config;
create policy "rw trip_config" on trip_config for all using (true) with check (true);
