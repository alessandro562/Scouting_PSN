-- ============================================================================
-- Scouting PSN — CRM Kanban :: Schema Supabase
-- ----------------------------------------------------------------------------
-- Esegui questo script nell'SQL Editor di Supabase (una sola volta).
-- Crea le tabelle, gli indici, i trigger e le policy Row-Level Security (RLS).
-- ============================================================================

-- pgcrypto fornisce gen_random_uuid() (di norma già attivo su Supabase)
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Funzione: aggiorna automaticamente updated_at ad ogni UPDATE
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Tabella: stages (colonne della board, modificabili dall'interfaccia)
-- ----------------------------------------------------------------------------
create table if not exists public.stages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists stages_position_idx on public.stages (position);

-- ----------------------------------------------------------------------------
-- Tabella: startups (le card del CRM)
-- ----------------------------------------------------------------------------
create table if not exists public.startups (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  sector     text,
  stage_id   uuid references public.stages(id) on delete set null,
  position   numeric not null default 1000,
  data       jsonb not null default '{}'::jsonb,
  psn        jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists startups_stage_idx  on public.startups (stage_id);
create index if not exists startups_sector_idx on public.startups (sector);

drop trigger if exists startups_set_updated_at on public.startups;
create trigger startups_set_updated_at
  before update on public.startups
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Tabella: notes (thread di note per ciascuna startup)
-- ----------------------------------------------------------------------------
create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  startup_id   uuid not null references public.startups(id) on delete cascade,
  body         text not null,
  author_id    uuid references auth.users(id),
  author_email text,
  created_at   timestamptz not null default now()
);
create index if not exists notes_startup_idx on public.notes (startup_id, created_at);

-- ----------------------------------------------------------------------------
-- Tabella: glossary (glossario tecnico di supporto)
-- ----------------------------------------------------------------------------
create table if not exists public.glossary (
  id       uuid primary key default gen_random_uuid(),
  term     text not null,
  text     text not null,
  refs     text,
  position integer not null default 0
);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Modello: team interno fidato. Ogni utente AUTENTICATO può leggere e scrivere.
-- Nessun accesso anonimo. Le note possono essere modificate/eliminate solo dal
-- proprio autore. created_by non può essere falsificato.
-- ============================================================================

alter table public.stages   enable row level security;
alter table public.startups enable row level security;
alter table public.notes    enable row level security;
alter table public.glossary enable row level security;

-- stages: lettura/scrittura per autenticati
drop policy if exists stages_all on public.stages;
create policy stages_all on public.stages
  for all to authenticated
  using (true) with check (true);

-- startups: lettura/scrittura per autenticati; created_by = utente corrente (o null)
drop policy if exists startups_select on public.startups;
create policy startups_select on public.startups
  for select to authenticated using (true);

drop policy if exists startups_insert on public.startups;
create policy startups_insert on public.startups
  for insert to authenticated
  with check (created_by is null or created_by = auth.uid());

drop policy if exists startups_update on public.startups;
create policy startups_update on public.startups
  for update to authenticated using (true) with check (true);

drop policy if exists startups_delete on public.startups;
create policy startups_delete on public.startups
  for delete to authenticated using (true);

-- notes: lettura per autenticati; insert solo come sé stessi; update/delete solo proprie
drop policy if exists notes_select on public.notes;
create policy notes_select on public.notes
  for select to authenticated using (true);

drop policy if exists notes_insert on public.notes;
create policy notes_insert on public.notes
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists notes_update on public.notes;
create policy notes_update on public.notes
  for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists notes_delete on public.notes;
create policy notes_delete on public.notes
  for delete to authenticated using (author_id = auth.uid());

-- glossary: lettura/scrittura per autenticati
drop policy if exists glossary_all on public.glossary;
create policy glossary_all on public.glossary
  for all to authenticated
  using (true) with check (true);

-- ============================================================================
-- REALTIME
-- ----------------------------------------------------------------------------
-- Aggiungi le tabelle alla pubblicazione realtime (idempotente).
-- ============================================================================
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.stages';   exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.startups'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.notes';    exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.glossary'; exception when duplicate_object then null; end;
end $$;

-- ============================================================================
-- saved_views — viste salvate (filtri/ordinamento) condivise nel team
-- ----------------------------------------------------------------------------
-- Aggiunta successiva: se lo schema base è già stato eseguito, basta eseguire
-- da qui in giù nel SQL Editor.
-- ============================================================================
create table if not exists public.saved_views (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_email text,
  config      jsonb not null default '{}'::jsonb,
  is_shared   boolean not null default true,
  created_by  uuid references auth.users(id) default auth.uid(),
  created_at  timestamptz not null default now()
);
create index if not exists saved_views_created_idx on public.saved_views (created_at);

alter table public.saved_views enable row level security;

drop policy if exists saved_views_select on public.saved_views;
create policy saved_views_select on public.saved_views
  for select to authenticated using (true);

drop policy if exists saved_views_insert on public.saved_views;
create policy saved_views_insert on public.saved_views
  for insert to authenticated
  with check (created_by is null or created_by = auth.uid());

drop policy if exists saved_views_update on public.saved_views;
create policy saved_views_update on public.saved_views
  for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists saved_views_delete on public.saved_views;
create policy saved_views_delete on public.saved_views
  for delete to authenticated using (created_by = auth.uid());

do $$
begin
  begin execute 'alter publication supabase_realtime add table public.saved_views'; exception when duplicate_object then null; end;
end $$;

-- ============================================================================
-- activity — registro attività condiviso (audit trail del team)
-- ----------------------------------------------------------------------------
-- Aggiunta successiva: se lo schema base è già stato eseguito, basta eseguire
-- da qui in giù nel SQL Editor. Log immutabile: solo lettura + insert come sé.
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

-- Nessuna policy di update/delete: il registro è immutabile.

do $$
begin
  begin execute 'alter publication supabase_realtime add table public.activity'; exception when duplicate_object then null; end;
end $$;
