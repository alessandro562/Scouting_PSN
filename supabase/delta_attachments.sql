-- ============================================================================
-- DELTA — Allegati delle startup (deck, documenti) su Supabase Storage
-- ----------------------------------------------------------------------------
-- Esegui questo blocco UNA VOLTA nell'SQL Editor di Supabase.
-- Crea un bucket PRIVATO: i file non sono accessibili pubblicamente, il CRM
-- genera link firmati temporanei per il download. È idempotente.
-- ============================================================================

-- Bucket privato per gli allegati (50 MB per file).
insert into storage.buckets (id, name, public, file_size_limit)
values ('attachments', 'attachments', false, 52428800)
on conflict (id) do nothing;

-- I file vivono in cartelle per startup: <startup_id>/<nome-file>

drop policy if exists attachments_read on storage.objects;
create policy attachments_read on storage.objects
  for select to authenticated
  using (bucket_id = 'attachments');

drop policy if exists attachments_insert on storage.objects;
create policy attachments_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'attachments');

drop policy if exists attachments_update on storage.objects;
create policy attachments_update on storage.objects
  for update to authenticated
  using (bucket_id = 'attachments') with check (bucket_id = 'attachments');

drop policy if exists attachments_delete on storage.objects;
create policy attachments_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'attachments');
