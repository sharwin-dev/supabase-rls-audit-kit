create table public.clients (
  id uuid primary key,
  shop_id uuid not null,
  owner_id uuid not null,
  name text not null
);

alter table public.clients enable row level security;

create policy "owners can read their clients"
on public.clients
for select
to authenticated
using (owner_id = auth.uid());
