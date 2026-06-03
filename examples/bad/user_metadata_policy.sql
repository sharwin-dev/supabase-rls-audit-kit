create table public.profiles (
  id uuid primary key,
  role text not null
);

alter table public.profiles enable row level security;

create policy "unsafe role claim"
on public.profiles
for select
to authenticated
using ((auth.jwt() -> 'user_metadata' ->> 'role') = role);
