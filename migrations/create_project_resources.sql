-- Table pour les ressources (Liens, Images, Fichiers liés au projet)
create table public.project_resources (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  type text not null, -- 'LINK', 'IMAGE', 'FILE'
  url text not null,
  created_at timestamptz default now()
);

-- Activer RLS
alter table public.project_resources enable row level security;

-- Politique pour que les utilisateurs gèrent leurs propres ressources
create policy "Users manage own resources" on public.project_resources for all using (auth.uid() = (select user_id from public.projects where id = project_id));
