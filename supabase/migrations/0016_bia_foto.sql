-- ============================================================
-- BIA: foto della scansione
-- Crea il "magazzino" (bucket) per le immagini e collega la foto
-- alla scansione. Additivo, rieseguibile.
-- Da incollare nel SQL Editor e cliccare Run.
-- ============================================================

-- 1) Campo per la foto sulla scansione
alter table bia_scan add column if not exists photo_url text;

-- 2) Magazzino immagini
insert into storage.buckets (id, name, public)
values ('bia', 'bia', true)
on conflict (id) do nothing;

-- 3) Permessi sul magazzino (solo per questo bucket)
drop policy if exists "bia lettura" on storage.objects;
create policy "bia lettura" on storage.objects
  for select using (bucket_id = 'bia');

drop policy if exists "bia scrittura" on storage.objects;
create policy "bia scrittura" on storage.objects
  for insert with check (bucket_id = 'bia');

drop policy if exists "bia cancella" on storage.objects;
create policy "bia cancella" on storage.objects
  for delete using (bucket_id = 'bia');
