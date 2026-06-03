create table public.clients (
  id uuid primary key,
  owner_id uuid not null,
  name text not null
);

alter table public.clients enable row level security;

create policy "owners can read clients"
on public.clients
for select
to authenticated
using (owner_id = auth.uid());

create view public.client_names
with (security_invoker = true)
as
select id, name from public.clients;
