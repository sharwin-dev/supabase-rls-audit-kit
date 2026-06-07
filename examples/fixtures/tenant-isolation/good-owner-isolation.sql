create table public.projects (
  id uuid primary key,
  owner_id uuid not null,
  name text not null
);

alter table public.projects enable row level security;

create policy "owners can read projects"
on public.projects
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can create projects"
on public.projects
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "owners can update projects"
on public.projects
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "owners can delete projects"
on public.projects
for delete
to authenticated
using ((select auth.uid()) = owner_id);
