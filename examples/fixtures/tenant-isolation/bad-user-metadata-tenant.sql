create table public.projects (
  id uuid primary key,
  tenant_id uuid not null,
  name text not null
);

alter table public.projects enable row level security;

create policy "users can read projects for metadata tenant"
on public.projects
for select
to authenticated
using (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
