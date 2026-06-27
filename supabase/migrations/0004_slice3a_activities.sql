-- ============================================================
-- FETTA 3a — Attività dichiarabili (oltre alle palestre A/B/C)
-- Aggiunge le "voci" corsa, calcetto, mobilità, balance, recupero come
-- sedute-template, così si possono dichiarare nel calendario settimanale.
-- NON tocca dati esistenti. Rieseguibile.
-- ============================================================

insert into session_template (code, name, type, priority_tier) values
  ('corsa',    'Corsa facile (Zona 2)', 'motore',   'P2'),
  ('calcetto', 'Calcetto',              'motore',   'P2'),
  ('mobilita', 'Mobilità',              'ancora',   'P0'),
  ('balance',  'Balance board',         'ancora',   'P0'),
  ('recovery', 'Recupero attivo',       'recovery', 'P0')
on conflict (code) do nothing;
