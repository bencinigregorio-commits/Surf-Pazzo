-- ============================================================
-- FETTA 7 — BIA (composizione corporea) + fase obiettivo
-- Scansioni BIA (set completo salvato) e storico della fase obiettivo.
-- NON tocca dati esistenti. Rieseguibile.
-- ============================================================

create table if not exists bia_scan (
  id          uuid primary key default gen_random_uuid(),
  scan_date   date not null default current_date,
  device      text,            -- dispositivo/fonte
  conditions  text,            -- es. a digiuno, mattina, pre-allenamento
  weight      numeric,
  fat_pct     numeric,
  fat_mass    numeric,
  lean_mass   numeric,
  tbw         numeric,         -- acqua corporea totale
  phase_angle numeric,         -- angolo di fase
  bmr         numeric,         -- metabolismo basale
  visceral    numeric,
  segmental   jsonb,
  comparable  boolean not null default true, -- confrontabile col trend?
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists bia_scan_date_idx on bia_scan (scan_date desc);

create table if not exists goal_phase (
  id         uuid primary key default gen_random_uuid(),
  phase      text not null
             check (phase in ('mantenimento', 'ricomposizione', 'asciugatura', 'costruzione')),
  set_on     date not null default current_date,
  created_at timestamptz not null default now()
);

-- Fase iniziale di default (solo se non c'è già).
insert into goal_phase (phase)
select 'mantenimento' where not exists (select 1 from goal_phase);

alter table bia_scan   enable row level security;
alter table goal_phase enable row level security;
drop policy if exists "rw bia_scan" on bia_scan;
create policy "rw bia_scan" on bia_scan for all using (true) with check (true);
drop policy if exists "rw goal_phase" on goal_phase;
create policy "rw goal_phase" on goal_phase for all using (true) with check (true);
