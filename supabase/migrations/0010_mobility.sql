-- ============================================================
-- Sezione Mobilità / Riscaldamento / Stretching
-- Schede diverse per contesto (generico, calcio, corsa, palestra A/B/C),
-- con fase "pre" (riscaldamento) e "post" (stretching).
-- Contenuto non personale -> sola lettura pubblica (come gli esercizi).
-- Da incollare nel SQL Editor e cliccare Run. Rieseguibile.
-- ============================================================

create table if not exists mobility_exercise (
  id           uuid primary key default gen_random_uuid(),
  context      text not null check (context in ('generico','calcio','corsa','A','B','C')),
  phase        text not null check (phase in ('pre','post')),
  order_index  int not null,
  name         text not null,
  prescription text,
  cue          text
);
create index if not exists mobility_ctx_idx on mobility_exercise (context, phase, order_index);

alter table mobility_exercise enable row level security;
drop policy if exists "lettura pubblica mobility" on mobility_exercise;
create policy "lettura pubblica mobility" on mobility_exercise for select using (true);
