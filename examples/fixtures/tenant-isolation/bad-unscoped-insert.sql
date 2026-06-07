create table public.projects (
  id uuid primary key,
  owner_id uuid not null,
  name text not null
);

alter table public.projects enable row level security;

create policy "authenticated users can create projects for any owner"
on public.projects
for insert
to authenticated
with check (true);
