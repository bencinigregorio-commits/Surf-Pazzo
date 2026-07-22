-- ============================================================
-- Beach volley + metriche delle attività (durata, distanza, battito, calorie)
-- Additivo: non tocca dati esistenti. Rieseguibile.
-- Da incollare nel SQL Editor e cliccare Run.
-- ============================================================

-- 1) Nuovo tipo di attività: beach volley
alter table session_template drop constraint if exists session_template_code_check;
alter table session_template add constraint session_template_code_check
  check (code in ('A','B','C','corsa','calcetto','mobilita','recovery','balance','campagna','beachvolley'));

insert into session_template (code, name, type, priority_tier, target_duration_min, target_duration_max)
values ('beachvolley', 'Beach volley', 'motore', 'P2', 45, 90)
on conflict (code) do nothing;

-- 2) Metriche sulle attività registrate
alter table day_log add column if not exists duration_min integer;   -- durata in minuti
alter table day_log add column if not exists distance_km  numeric;   -- km (corsa)
alter table day_log add column if not exists avg_hr       integer;   -- battito medio
alter table day_log add column if not exists calories     numeric;   -- calorie (stimate o inserite)
