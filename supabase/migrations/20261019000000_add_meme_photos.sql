begin;

alter table public.generations
  add column if not exists image_url text,
  add column if not exists image_alt text,
  add column if not exists image_source text check (image_source in ('upload', 'ai-pick')),
  add column if not exists image_credit_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meme-photos', 'meme-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Meme photos are publicly readable" on storage.objects;
create policy "Meme photos are publicly readable"
on storage.objects for select to anon, authenticated
using (bucket_id = 'meme-photos');

drop policy if exists "Users can upload their own meme photos" on storage.objects;
create policy "Users can upload their own meme photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'meme-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can remove their own meme photos" on storage.objects;
create policy "Users can remove their own meme photos"
on storage.objects for delete to authenticated
using (bucket_id = 'meme-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
