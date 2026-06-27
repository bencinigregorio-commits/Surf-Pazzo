-- ============================================================
-- FETTA 2 — Log delle sedute (3 livelli) + completamento
-- Da incollare nel "SQL Editor" di Supabase e cliccare "Run".
-- Sicuro da rieseguire.
-- ============================================================

drop table if exists exercise_log cascade;
drop table if exists day_log cascade;

-- La "seduta del giorno" (un record per allenamento registrato)
create table day_log (
  id                   uuid primary key default gen_random_uuid(),
  log_date             date not null default current_date,
  session_code         text references session_template(code),  -- A/B/C/corsa/...
  status               text not null default 'done'
                        check (status in ('done','partial','skipped','rest')),
  session_rpe          int  check (session_rpe between 1 and 10), -- voto fatica di seduta
  perceived_week_state text check (perceived_week_state in ('fresco','ok','cotto')),
  notes                text,
  created_at           timestamptz not null default now()
);

-- I singoli esercizi registrati dentro una seduta (solo se vuoi il dettaglio)
create table exercise_log (
  id                uuid primary key default gen_random_uuid(),
  day_log_id        uuid not null references day_log(id) on delete cascade,
  exercise_id       uuid not null references exercise(id),
  completed         text not null default 'full'
                    check (completed in ('full','partial','none')),
  load              numeric,        -- carico (kg), se inserito
  sets              int,
  reps              text,
  rpe               int  check (rpe between 1 and 10),
  technical_quality int  check (technical_quality between 1 and 5),
  pain_region       text,           -- es. spalla, lombare, cervicale...
  pain_severity     int  check (pain_severity between 0 and 3),
  notes             text
);

create index on exercise_log (day_log_id);
create index on day_log (log_date desc);

-- ============================================================
-- Sicurezza (RLS) — DATI PERSONALI.
-- Per ora (sviluppo locale, utente singolo, ancora senza login) consentiamo
-- lettura/scrittura con la chiave pubblica. PRIMA di pubblicare su Vercel
-- aggiungeremo il login via email e legheremo i dati all'utente.
-- ============================================================
alter table day_log      enable row level security;
alter table exercise_log enable row level security;

create policy "rw day_log"      on day_log      for all using (true) with check (true);
create policy "rw exercise_log" on exercise_log for all using (true) with check (true);
