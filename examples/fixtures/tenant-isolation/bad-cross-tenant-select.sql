create table public.projects (
  id uuid primary key,
  owner_id uuid not null,
  name text not null
);

alter table public.projects enable row level security;

create policy "authenticated users can read every project"
on public.projects
for select
to authenticated
using (true);
