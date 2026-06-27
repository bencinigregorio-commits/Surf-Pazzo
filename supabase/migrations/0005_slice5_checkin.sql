-- ============================================================
-- FETTA 5 — Check-in soggettivo di fatica (fresco / ok / cotto)
-- Una tabella per salvare "come ti senti", usata per correggere lo
-- stato di fatica della settimana (il soggettivo vince sul numero).
-- NON tocca dati esistenti. Rieseguibile.
-- ============================================================

create table if not exists week_checkin (
  id           uuid primary key default gen_random_uuid(),
  checkin_date date not null default current_date,
  state        text not null check (state in ('fresco', 'ok', 'cotto')),
  created_at   timestamptz not null default now()
);
create index if not exists week_checkin_created_idx on week_checkin (created_at desc);

-- Dati personali: per ora lettura/scrittura con la chiave pubblica (auth più avanti).
alter table week_checkin enable row level security;
drop policy if exists "rw week_checkin" on week_checkin;
create policy "rw week_checkin" on week_checkin for all using (true) with check (true);
