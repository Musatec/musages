-- Création de la table des ressources personnelles
create table public.personal_resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text, -- Pour les prompts ou les détails
  url text, -- Pour les liens ou images
  type text not null, -- 'LINK', 'PROMPT', 'IDEA', 'IMAGE'
  category text not null, -- 'IA', 'Design', 'Code', 'Marketing', 'Autre'
  created_at timestamptz default now()
);

-- Activation de la sécurité au niveau des lignes
alter table public.personal_resources enable row level security;

-- Création de la politique de sécurité
create policy "Users manage own personal resources" on public.personal_resources for all using (auth.uid() = user_id);
