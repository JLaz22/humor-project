-- Exercise the real RLS policies without leaving posts, votes or storage rows.
begin;

select set_config('request.jwt.claim.sub', (select id::text from auth.users limit 1), true);
set local role authenticated;

insert into public.generations (id, user_id, prompt, style, generation_prompt, content, model, image_url, image_alt, image_source)
values (-9000000001, auth.uid(), 'Photo integration check', 'deadpan', 'Integration check', 'A photo meme integration check.', 'test', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 'Coffee on a table', 'ai-pick');

insert into public.votes (id, generation_id, user_id, value)
values (-9000000001, -9000000001, auth.uid(), 1);

do $$
begin
  if not exists (select 1 from public.generations where id = -9000000001 and upvotes = 1 and image_source = 'ai-pick' and image_url is not null) then
    raise exception 'Photo post or vote totals failed';
  end if;

  begin
    insert into public.votes (id, generation_id, user_id, value)
    values (-9000000002, -9000000001, auth.uid(), -1);
    raise exception 'Duplicate vote was incorrectly accepted';
  exception when unique_violation then null;
  end;

  insert into storage.objects (bucket_id, name)
  values ('meme-photos', auth.uid()::text || '/integration-check.jpg');

  begin
    insert into storage.objects (bucket_id, name)
    values ('meme-photos', 'not-the-current-user/integration-check.jpg');
    raise exception 'Foreign upload was incorrectly accepted';
  exception when insufficient_privilege then null;
  end;
end $$;

set local role anon;
do $$
begin
  if not exists (select 1 from public.generations where id = -9000000001 and image_url is not null) then
    raise exception 'Public photo feed is not readable';
  end if;
  begin
    insert into public.votes (id, generation_id, user_id, value)
    values (-9000000003, -9000000001, '00000000-0000-0000-0000-000000000000', 1);
    raise exception 'Anonymous voting was incorrectly accepted';
  exception when insufficient_privilege then null;
  end;
end $$;

rollback;
