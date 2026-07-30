-- ============================================================================
-- DELTA — Registro attività condiviso (audit trail)
-- ----------------------------------------------------------------------------
-- Esegui questo blocco UNA VOLTA nell'SQL Editor di Supabase per abilitare il
-- "Registro attività" del CRM. È idempotente e non tocca i dati esistenti.
-- ============================================================================
create table if not exists public.activity (
  id          uuid primary key default gen_random_uuid(),
  startup_id  uuid references public.startups(id) on delete cascade,
  actor_id    uuid references auth.users(id) default auth.uid(),
  actor_email text,
  type        text not null,           -- move | create | update | note | stage
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists activity_startup_idx on public.activity (startup_id, created_at desc);
create index if not exists activity_created_idx on public.activity (created_at desc);

alter table public.activity enable row level security;

drop policy if exists activity_select on public.activity;
create policy activity_select on public.activity
  for select to authenticated using (true);

drop policy if exists activity_insert on public.activity;
create policy activity_insert on public.activity
  for insert to authenticated
  with check (actor_id is null or actor_id = auth.uid());

do $$
begin
  begin execute 'alter publication supabase_realtime add table public.activity'; exception when duplicate_object then null; end;
end $$;
