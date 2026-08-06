insert into storage.buckets (id, name, public, file_size_limit)
values ('pet-photos', 'pet-photos', true, 10485760)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "Users can read pet photos" on storage.objects;
create policy "Users can read pet photos"
on storage.objects for select
to public
using (bucket_id = 'pet-photos');

drop policy if exists "Users can upload pet photos" on storage.objects;
create policy "Users can upload pet photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pet-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own pet photos" on storage.objects;
create policy "Users can update own pet photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'pet-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'pet-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own pet photos" on storage.objects;
create policy "Users can delete own pet photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pet-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
