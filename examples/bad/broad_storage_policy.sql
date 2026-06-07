create policy "authenticated users can upload anywhere"
on storage.objects
for insert
to authenticated
with check (true);
