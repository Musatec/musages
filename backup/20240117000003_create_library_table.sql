-- Création de la table bibliothèque de ressources
create table if not exists public.personal_resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  url text,
  type text not null check (type in ('PROMPT', 'LINK', 'IMAGE', 'IDEA')),
  category text default 'General',
  created_at timestamptz default now()
);

-- Activation de la sécurité au niveau des lignes
alter table public.personal_resources enable row level security;

-- Politique de sécurité : utilisateurs ne voient que leurs propres ressources
drop policy if exists "Users manage own personal resources" on public.personal_resources;
create policy "Users manage own personal resources" on public.personal_resources for all using (auth.uid() = user_id);

-- Index pour optimiser les performances
create index if not exists personal_resources_user_id_idx on public.personal_resources (user_id);
create index if not exists personal_resources_type_idx on public.personal_resources (type);
create index if not exists personal_resources_created_at_idx on public.personal_resources (created_at);
