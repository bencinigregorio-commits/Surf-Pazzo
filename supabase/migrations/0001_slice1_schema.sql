-- ============================================================
-- FETTA 1 — Scheletro dati: libreria esercizi + 3 sedute (A, B, C)
-- Da incollare nel "SQL Editor" di Supabase e cliccare "Run".
-- Sicuro da rieseguire: ricrea tutto da zero ogni volta.
-- ============================================================

-- 1) Pulizia (utile se rilanci lo script durante lo sviluppo)
drop table if exists session_exercise cascade;
drop table if exists session_template cascade;
drop table if exists exercise cascade;

-- 2) Libreria esercizi
create table exercise (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  category        text,
  progression_type text not null
                  check (progression_type in ('load','ballistic','skill','endurance')),
  default_sets    int,
  default_reps    text,                 -- testo: "8-10", "8/gamba", "8-12'"
  load_step       numeric,              -- incremento di carico (null se a corpo libero)
  variation_ladder text[],              -- scala di varianti (per skill)
  body_regions    text[],               -- regioni coinvolte (per gestione dolore)
  priority_tier   text,                 -- es. 'core' | 'prevention'
  is_daily_anchor boolean not null default false,
  cue             text                  -- nota tecnica breve mostrata nell'app
);

-- 3) Sedute (template)
create table session_template (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique
                  check (code in ('A','B','C','corsa','calcetto','mobilita','recovery','balance')),
  name            text not null,
  type            text,
  priority_tier   text,
  target_duration_min int,
  target_duration_max int
);

-- 4) Quale esercizio sta in quale seduta (e in che ordine)
create table session_exercise (
  id                  uuid primary key default gen_random_uuid(),
  session_template_id uuid not null references session_template(id) on delete cascade,
  exercise_id         uuid not null references exercise(id) on delete cascade,
  order_index         int not null,
  prescription        text,             -- es. "4 × 12", "3 × 8/gamba"
  unique (session_template_id, order_index)
);

-- ============================================================
-- 5) Sicurezza (RLS): queste sono tabelle di "contenuto" non personale
--    (la libreria del programma). Permettiamo solo la LETTURA pubblica.
--    I dati personali (log, BIA) avranno regole piu' severe nelle fette successive.
-- ============================================================
alter table exercise          enable row level security;
alter table session_template  enable row level security;
alter table session_exercise  enable row level security;

create policy "lettura pubblica esercizi"  on exercise         for select using (true);
create policy "lettura pubblica sedute"    on session_template for select using (true);
create policy "lettura pubblica legami"    on session_exercise for select using (true);

-- ============================================================
-- 6) DATI — gli esercizi reali dal tuo programma
-- ============================================================
insert into exercise (name, category, progression_type, default_sets, default_reps, load_step, body_regions, priority_tier, cue) values
-- Palestra A — Forza & Potenza
('Kettlebell swing',            'potenza',     'ballistic', 4, '12',        2.5, '{lombare}',            'core',       'Hip hinge pulito, schiena neutra: forza dal suolo (anca-tronco).'),
('Bulgarian split squat',       'forza',       'load',      3, '8/gamba',   2.5, '{ginocchio}',          'core',       'Forza unilaterale: corregge gli squilibri gamba avanti/dietro.'),
('Narrow push-up esplosivo',    'potenza',     'ballistic', 4, '8-10',      null,'{spalla,polso}',       'core',       'Spinta del pop-up; gomiti stretti = meno stress sulla spalla.'),
('Swiss ball jackknife',        'core',        'load',      3, '10-12',     null,'{lombare}',            'core',       'Flessione d''anca + core anteriore, senza compensare di lombare.'),
('Pallof press ai cavi',        'core',        'load',      3, '10/lato',   null,'{lombare}',            'core',       'Anti-rotazione al cavo.'),
('Drill pop-up',                'skill',       'skill',     4, '5',         null,'{}',                   'core',       'Gesto completo a terra: prono->stance, sguardo all''orizzonte.'),
-- Palestra B — Pagaiata & Resistenza
('Trazioni presa larga',        'tirata',      'load',      4, '6-12',      null,'{spalla}',             'core',       'Motori della bracciata: dorsale, rotondo, spalla posteriore.'),
('Rematore / pulley basso',     'tirata',      'load',      3, '12-15',     null,'{spalla}',             'core',       'Alta schiena, scapole che si avvicinano.'),
('Prone Y''s with chest lift',  'prevenzione', 'load',      3, '10',        null,'{spalla,cervicale}',   'prevention', 'Mento retratto per scaricare la cervicale.'),
('Prone overhead shoulder hovers','prevenzione','load',     3, '12',        null,'{spalla}',             'prevention', 'Rinforza la spalla posteriore in overhead.'),
('Face pull',                   'prevenzione', 'load',      4, '15',        null,'{spalla,cervicale}',   'prevention', 'Fisso. Salute spalla + ottimo per trapezi/cervicale.'),
('Extrarotazioni con elastico', 'prevenzione', 'load',      3, '12/lato',   null,'{spalla}',             'prevention', 'Cuffia dei rotatori.'),
('Resistenza di pagaiata (ski-erg)','endurance','endurance',null,'8-12''',  null,'{spalla}',             'core',       'Gesto-ponte verso la pagaiata. Pre-trip: diventa centrale.'),
-- Palestra C — Atletico & Stabilita'
('Single-leg RDL',              'forza',       'load',      3, '8/gamba',   2.5, '{lombare,ginocchio}',  'core',       'Catena posteriore + equilibrio.'),
('Cossack squat',               'mobilita',    'load',      3, '8/lato',    null,'{ginocchio,caviglia}', 'core',       'Adduttori e carico asimmetrico: la postura dei bottom turn.'),
('Skater jump',                 'potenza',     'ballistic', 3, '8/lato',    null,'{ginocchio,caviglia}', 'core',       'Piano frontale, atterraggio e stabilizzazione monopodalica.'),
('Lancio rotazionale med-ball', 'potenza',     'ballistic', 3, '6/lato',    null,'{lombare}',            'core',       'Ruota ed esplodi da anche e tronco: rotazione balistica.'),
('Bird-dog segmentale',         'prevenzione', 'skill',     3, '8/diagonale',null,'{lombare}',           'prevention', 'Tenuta 3". Catena crociata posteriore, prevenzione lombare.'),
('Suitcase carry',              'core',        'load',      3, '30 m/lato', null,'{lombare,polso}',      'core',       'Anti-flessione laterale. Progressione: prima distanza, poi carico.'),
('Compass foot tap',            'stabilita',   'skill',     3, '1''/gamba', null,'{caviglia,ginocchio}', 'core',       'Stabilita'' di caviglia e ginocchio (anche su balance board).');

-- Sedute portanti
insert into session_template (code, name, type, priority_tier, target_duration_min, target_duration_max) values
('A', 'Palestra A — Forza & Potenza',        'portante', 'P1', 45, 60),
('B', 'Palestra B — Pagaiata & Resistenza',  'portante', 'P1', 45, 60),
('C', 'Palestra C — Atletico & Stabilità',   'portante', 'P1', 45, 60);

-- Legami seduta <-> esercizio (ordine + prescrizione)
-- Palestra A
insert into session_exercise (session_template_id, exercise_id, order_index, prescription)
select s.id, e.id, v.ord, v.presc
from (values
  ('Kettlebell swing',1,'4 × 12'),
  ('Bulgarian split squat',2,'3 × 8/gamba'),
  ('Narrow push-up esplosivo',3,'4 × 8-10'),
  ('Swiss ball jackknife',4,'3 × 10-12'),
  ('Pallof press ai cavi',5,'3 × 10/lato'),
  ('Drill pop-up',6,'4 × 5')
) as v(ex_name, ord, presc)
join session_template s on s.code = 'A'
join exercise e on e.name = v.ex_name;

-- Palestra B
insert into session_exercise (session_template_id, exercise_id, order_index, prescription)
select s.id, e.id, v.ord, v.presc
from (values
  ('Trazioni presa larga',1,'4 × 6-12'),
  ('Rematore / pulley basso',2,'3 × 12-15'),
  ('Prone Y''s with chest lift',3,'3 × 10'),
  ('Prone overhead shoulder hovers',4,'3 × 12'),
  ('Face pull',5,'4 × 15'),
  ('Extrarotazioni con elastico',6,'3 × 12/lato'),
  ('Resistenza di pagaiata (ski-erg)',7,'8-12'' continuo o 3 round circuito')
) as v(ex_name, ord, presc)
join session_template s on s.code = 'B'
join exercise e on e.name = v.ex_name;

-- Palestra C
insert into session_exercise (session_template_id, exercise_id, order_index, prescription)
select s.id, e.id, v.ord, v.presc
from (values
  ('Single-leg RDL',1,'3 × 8/gamba'),
  ('Cossack squat',2,'3 × 8/lato'),
  ('Skater jump',3,'3 × 8/lato'),
  ('Lancio rotazionale med-ball',4,'3 × 6/lato'),
  ('Bird-dog segmentale',5,'3 × 8/diagonale'),
  ('Suitcase carry',6,'3 × 30 m/lato'),
  ('Compass foot tap',7,'3 × 1''/gamba')
) as v(ex_name, ord, presc)
join session_template s on s.code = 'C'
join exercise e on e.name = v.ex_name;
