-- Création de la table bibliothèque de ressources
create table if not exists public.personal_resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text, -- Contenu textuel pour les prompts, idées, etc.
  url text, -- URL pour les liens et images
  type text not null check (type in ('PROMPT', 'LINK', 'IMAGE', 'IDEA')),
  tags text[] default '{}', -- Array de tags pour le filtrage
  created_at timestamptz default now()
);

-- Activation de la sécurité au niveau des lignes
alter table public.personal_resources enable row level security;

-- Politique de sécurité : utilisateurs ne voient que leurs propres ressources
drop policy if exists "Users manage own personal resources" on public.personal_resources;
create policy "Users manage own personal resources" on public.personal_resources for all using (auth.uid() = user_id);

-- Création d'un index sur les tags pour de meilleures performances
create index if not exists personal_resources_tags_idx on public.personal_resources using gin (tags);

-- Création d'un index sur le type pour le filtrage
create index if not exists personal_resources_type_idx on public.personal_resources (type);

-- Création d'un index sur user_id pour la sécurité
create index if not exists personal_resources_user_id_idx on public.personal_resources (user_id);
