-- ============================================================
-- Scheda CAMPAGNA — Mantenimento (attrezzatura minima)
-- Additivo: non tocca sedute, esercizi, log o schermate esistenti.
-- Gli esercizi hanno nomi propri: restano righe separate, quindi le
-- progressioni di A/B/C non vengono toccate.
-- Rieseguibile. Da incollare nel SQL Editor e cliccare Run.
-- ============================================================

-- 1) Permetti il nuovo codice seduta e il flag mantenimento
alter table session_template drop constraint if exists session_template_code_check;
alter table session_template add constraint session_template_code_check
  check (code in ('A','B','C','corsa','calcetto','mobilita','recovery','balance','campagna'));

alter table session_template add column if not exists is_maintenance boolean not null default false;

-- 2) La seduta
insert into session_template (code, name, type, priority_tier, target_duration_min, target_duration_max, is_maintenance)
values ('campagna', 'Campagna — Mantenimento', 'portante', 'P1', 40, 60, true)
on conflict (code) do update
  set name = excluded.name,
      type = excluded.type,
      priority_tier = excluded.priority_tier,
      target_duration_min = excluded.target_duration_min,
      target_duration_max = excluded.target_duration_max,
      is_maintenance = true;

-- 3) Gli esercizi (nomi propri della scheda Campagna)
insert into exercise (name, category, progression_type, default_sets, default_reps, body_regions, priority_tier, cue) values
('Rematore con elastico arancione (o TRX)','tirata','load',3,'12-15','{spalla}','core','Il lavoro-pagaiata: gomiti indietro, scapole che si avvicinano. Il piu'' importante della scheda.'),
('Pagaiata simulata con elastico','endurance','endurance',3,'40"','{spalla}','core','Elastico ancorato in alto, busto inclinato. Il sostituto piu'' vicino allo ski-erg.'),
('Push-up (a terra o al TRX)','spinta','load',3,'8-12','{spalla,polso}','core','Spinta del pop-up; gomiti non troppo larghi.'),
('Affondo inverso con 3 kg','forza','load',3,'8-10/gamba','{ginocchio}','core','Forza gambe + unilaterale.'),
('Single-leg RDL con 3 kg','forza','load',3,'8/gamba','{lombare,ginocchio}','core','Catena posteriore + equilibrio.'),
('Face pull con elastico arancione','prevenzione','load',3,'15','{spalla,cervicale}','prevention','Salute spalla + cervicale. Gomiti alti, mento retratto.'),
('Alzate laterali + frontali 3 kg','spalla','load',2,'15','{spalla}','core','Endurance del deltoide: leggere e pulite.'),
('Pallof press con elastico arancione','core','load',3,'10/lato','{lombare}','core','Anti-rotazione: resisti alla torsione, non ruotare.'),
('Ab wheel rollout','core','load',3,'8-10','{lombare}','core','In ginocchio, range corto: solo fin dove tieni la lombare neutra, mai inarcare.'),
('Bird-dog','prevenzione','skill',3,'8/diagonale','{lombare}','prevention','Tenuta 3". Catena crociata posteriore.'),
('Side plank','core','skill',3,'30"/lato','{lombare}','core','Anti-flessione laterale, bacino alto.'),
('Corda a intervalli','endurance','endurance',NULL,'6-8 × (30"/30")','{caviglia}','core','Motore pagaiata (sostituisce lo ski-erg). Alternativa: 8-10'' continui.'),
('Pop-up rehearsal','skill','skill',3,'5','{}','core','Sul tappetino: qualita'', non fretta.')
on conflict (name) do nothing;

-- 4) Collega gli esercizi alla seduta (ordine della scheda)
delete from session_exercise
where session_template_id = (select id from session_template where code = 'campagna');

insert into session_exercise (session_template_id, exercise_id, order_index, prescription)
select s.id, e.id, v.ord, v.presc
from (values
  ('Rematore con elastico arancione (o TRX)',1,'3 × 12-15'),
  ('Pagaiata simulata con elastico',2,'3 × 40"'),
  ('Push-up (a terra o al TRX)',3,'3 × 8-12'),
  ('Affondo inverso con 3 kg',4,'3 × 8-10/gamba'),
  ('Single-leg RDL con 3 kg',5,'3 × 8/gamba'),
  ('Face pull con elastico arancione',6,'3 × 15'),
  ('Alzate laterali + frontali 3 kg',7,'2 × 15'),
  ('Pallof press con elastico arancione',8,'3 × 10/lato'),
  ('Ab wheel rollout',9,'3 × 8-10'),
  ('Bird-dog',10,'3 × 8/diagonale'),
  ('Side plank',11,'3 × 30"/lato'),
  ('Corda a intervalli',12,'6-8 × (30" veloce / 30" lento)'),
  ('Pop-up rehearsal',13,'3 × 5')
) as v(ex_name, ord, presc)
join session_template s on s.code = 'campagna'
join exercise e on e.name = v.ex_name;
