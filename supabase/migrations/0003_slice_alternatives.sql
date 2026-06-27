-- ============================================================
-- AGGIORNAMENTO — Alternative agli esercizi
-- Aggiunge una tabella per le alternative ("piano B") di ogni esercizio.
-- NON tocca sedute, esercizi o log gia' salvati.
-- Da incollare nel "SQL Editor" di Supabase e cliccare "Run". Rieseguibile.
-- ============================================================

drop table if exists exercise_alternative cascade;

create table exercise_alternative (
  id                  uuid primary key default gen_random_uuid(),
  primary_exercise_id uuid not null references exercise(id) on delete cascade,
  alt_name            text not null,
  alt_prescription    text,
  reason              text,        -- perche'/quando usarla
  order_index         int not null default 1
);
create index on exercise_alternative (primary_exercise_id);

-- Sicurezza: contenuto non personale -> sola lettura pubblica (come la libreria esercizi)
alter table exercise_alternative enable row level security;
create policy "lettura pubblica alternative" on exercise_alternative for select using (true);

-- Dati: un'alternativa per esercizio (il Drill pop-up non ne ha: e' skill)
insert into exercise_alternative (primary_exercise_id, alt_name, alt_prescription, reason)
select e.id, v.alt_name, v.presc, v.reason
from (values
  -- Palestra A
  ('Kettlebell swing',            'Stacco rumeno con manubri',                    '3 × 8',            'Stessa catena posteriore con meno componente balistica: se il kettlebell è occupato o la lombare è sensibile quel giorno.'),
  ('Bulgarian split squat',       'Reverse lunge con manubri',                    '3 × 8/gamba',      'Stesso unilaterale, meno richiesta di equilibrio: se non hai panca o la gamba dietro elevata dà fastidio al ginocchio.'),
  ('Narrow push-up esplosivo',    'Panca piana con manubri (presa neutra)',       '3 × 8',            'Stessa spinta orizzontale a gomiti stretti, se polsi o spalla danno fastidio nell''appoggio a terra.'),
  ('Swiss ball jackknife',        'Mountain climber lenti e controllati',         '3 × 20 totali',    'Stesso pattern di richiamo gamba sotto il petto, se la palla è occupata.'),
  ('Pallof press ai cavi',        'Pallof press con elastico',                    '3 × 10/lato',      'Stessa identica funzione, se le postazioni cavi sono tutte occupate.'),
  -- Palestra B
  ('Trazioni presa larga',        'Lat machine presa larga',                      '4 × 12-15',        'Da usare quando le trazioni libere non vengono pulite o se non c''è la sbarra.'),
  ('Rematore / pulley basso',     'Rematore con manubrio (un braccio)',           '3 × 12/lato',      'Stessa funzione se il pulley è occupato; bonus: lavoro unilaterale che corregge le asimmetrie.'),
  ('Prone Y''s with chest lift',  'Band Y raise in piedi (elastico leggero)',     '3 × 12',           'Stessa attivazione del trapezio inferiore senza carico in iperestensione, se lombare o collo danno fastidio nel prono.'),
  ('Prone overhead shoulder hovers','Band pull-apart sopra la testa',             '3 × 12',           'Stessa zona, in piedi, se il prono ti dà fastidio.'),
  ('Face pull',                   'Face pull con elastico',                       '4 × 15',           'Stessa identica funzione, se i cavi sono tutti occupati.'),
  ('Extrarotazioni con elastico', 'Extrarotazioni con manubrio (decubito laterale)','3 × 12/lato',    'Stessa funzione sulla cuffia, se non hai un elastico a portata.'),
  ('Resistenza di pagaiata (ski-erg)','Pagaiata simulata prona + battle rope',    '3 × 60" + 3 × 40"','Se non c''è né ski-erg né vogatore. Meno specifico ma copre la funzione.'),
  -- Palestra C
  ('Single-leg RDL',              'Stacco rumeno con manubri (due gambe)',        '3 × 10',           'Stessa catena posteriore con meno richiesta di equilibrio, se la stabilità monopodalica fa cedere la tecnica.'),
  ('Cossack squat',               'Affondi laterali con manubrio',                '3 × 8/lato',       'Stesso piano frontale, meno richiesta di mobilità d''anca, se la profondità del Cossack non è ancora pulita.'),
  ('Skater jump',                 'Lateral bound in tenuta (senza salto)',        '3 × 6/lato (2")',  'Stesso pattern frontale senza impatto, se ginocchio o caviglia danno fastidio.'),
  ('Lancio rotazionale med-ball', 'Cable wood chop esplosivo',                    '3 × 8/lato',       'Genera rotazione contro carico (meno balistico), se non c''è un muro libero per il lancio.'),
  ('Bird-dog segmentale',         'Dead bug',                                     '3 × 8/lato',       'Stessa anti-estensione lombare da supino, se a quattro zampe il polso dà fastidio.'),
  ('Suitcase carry',              'Side plank',                                   '3 × 30"/lato',     'Stessa anti-flessione laterale in statico, se non hai spazio per camminare.'),
  ('Compass foot tap',            'Single-leg stance su cuscino/Bosu (con reach)','3 × 45"/gamba',    'Stessa stabilità monopodalica reattiva, se non hai la balance board in palestra.')
) as v(ex_name, alt_name, presc, reason)
join exercise e on e.name = v.ex_name;
