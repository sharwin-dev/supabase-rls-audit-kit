create or replace function public.delete_client(client_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.clients where id = client_id;
end;
$$;

grant execute on function public.delete_client(uuid) to authenticated;
