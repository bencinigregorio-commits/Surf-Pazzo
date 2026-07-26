-- ============================================================
-- Tempi di recupero per esercizio (sedute A, B, C)
-- Additivo: aggiunge rest_seconds (secondi, per il calcolo adattivo) e
-- rest_label (testo del range, per mostrarlo intero). Non tocca altro.
-- Rieseguibile. Da incollare nel SQL Editor e cliccare Run.
-- ============================================================

alter table session_exercise add column if not exists rest_seconds integer;
alter table session_exercise add column if not exists rest_label   text;

-- Popola per (codice seduta, nome esercizio)
update session_exercise se
set rest_seconds = v.sec, rest_label = v.lbl
from (values
  -- PALESTRA A
  ('A','Kettlebell swing',            90, '75–90"'),
  ('A','Bulgarian split squat',      120, '90–120" (tra le gambe 30–45")'),
  ('A','Narrow push-up esplosivo',    90, '90"'),
  ('A','Swiss ball jackknife',        60, '45–60"'),
  ('A','Pallof press ai cavi',        60, '45–60"'),
  ('A','Drill pop-up',                60, '60"'),
  -- PALESTRA B (recuperi corti)
  ('B','Trazioni presa larga',        90, '90"'),
  ('B','Rematore / pulley basso',     75, '60–75"'),
  ('B','Prone Y''s with chest lift',  45, '45"'),
  ('B','Prone overhead shoulder hovers',45,'45"'),
  ('B','Face pull',                   60, '45–60"'),
  ('B','Extrarotazioni con elastico', 45, '30–45"'),
  ('B','Resistenza di pagaiata (ski-erg)',90,'60–90" tra i round'),
  -- PALESTRA C
  ('C','Single-leg RDL',              90, '60–90"'),
  ('C','Cossack squat',               90, '60–90"'),
  ('C','Skater jump',                 90, '90"'),
  ('C','Lancio rotazionale med-ball',120, '90–120"'),
  ('C','Bird-dog segmentale',         45, '45"'),
  ('C','Suitcase carry',              90, '60–90"'),
  ('C','Compass foot tap',            60, '45–60"')
) as v(code, ex_name, sec, lbl)
where se.session_template_id = (select id from session_template where code = v.code)
  and se.exercise_id = (select id from exercise where name = v.ex_name);
