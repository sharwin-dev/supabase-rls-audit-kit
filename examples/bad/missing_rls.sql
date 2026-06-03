create table public.clients (
  id uuid primary key,
  shop_id uuid not null,
  name text not null
);

grant select on public.clients to authenticated;
