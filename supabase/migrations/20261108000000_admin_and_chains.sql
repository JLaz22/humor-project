begin;
alter table public.profiles add column if not exists is_superadmin boolean not null default false;
-- Profile owners may edit their names, but can never grant themselves administrator access.
create or replace function public.protect_superadmin() returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('anon', 'authenticated') and
    ((TG_OP = 'INSERT' and new.is_superadmin) or (TG_OP = 'UPDATE' and new.is_superadmin is distinct from old.is_superadmin)) then
    raise exception 'Administrator roles can only be assigned by the database owner';
  end if;
  return new;
end $$;
drop trigger if exists protect_superadmin on public.profiles;
create trigger protect_superadmin before insert or update on public.profiles for each row execute function public.protect_superadmin();
create or replace function public.is_superadmin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and is_superadmin = true)
$$;
revoke all on function public.is_superadmin() from public;
grant execute on function public.is_superadmin() to authenticated;
drop policy if exists "Superadmins read profiles" on public.profiles;
create policy "Superadmins read profiles" on public.profiles for select to authenticated using (public.is_superadmin());

create table public.llm_providers (
 id uuid primary key default gen_random_uuid(), name text not null unique,
 api_kind text not null default 'gemini' check(api_kind in ('gemini','openai')),
 created_at timestamptz not null default now()
);
create table public.llm_models (
 id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.llm_providers(id) on delete restrict,
 name text not null, model_id text not null, enabled boolean not null default true,
 created_at timestamptz not null default now(), unique(provider_id, model_id)
);
create table public.prompt_chains (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 120),
 description text not null default '', created_at timestamptz not null default now()
);
create table public.prompt_chain_steps (
 id uuid primary key default gen_random_uuid(), chain_id uuid not null references public.prompt_chains(id) on delete cascade,
 model_id uuid not null references public.llm_models(id) on delete restrict,
 name text not null, prompt text not null check(length(prompt) between 1 and 16000),
 position integer not null check(position >= 0), temperature numeric not null default 1 check(temperature between 0 and 2),
 created_at timestamptz not null default now(), unique(chain_id, position) deferrable initially deferred
);
create table public.prompt_chain_mix (
 id uuid primary key default gen_random_uuid(), chain_id uuid not null unique references public.prompt_chains(id) on delete cascade,
 weight numeric not null default 1 check(weight >= 0), enabled boolean not null default true, created_at timestamptz not null default now()
);
create or replace function public.add_chain_mix() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.prompt_chain_mix(chain_id) values(new.id); return new; end $$;
drop trigger if exists chain_mix on public.prompt_chains;
create trigger chain_mix after insert on public.prompt_chains for each row execute function public.add_chain_mix();
create table public.terms (
 id uuid primary key default gen_random_uuid(), term text not null unique, definition text not null, created_at timestamptz not null default now()
);
create table public.ai_generation_examples (
 id uuid primary key default gen_random_uuid(), input text not null, output text not null, explanation text not null default '', created_at timestamptz not null default now()
);
create table public.allowed_signup_domains (
 id uuid primary key default gen_random_uuid(), domain text not null unique check(domain = lower(domain) and domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'), created_at timestamptz not null default now()
);
create table public.whitelisted_emails (
 id uuid primary key default gen_random_uuid(), email text not null unique check(email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'), created_at timestamptz not null default now()
);
create or replace function public.signup_email_allowed(candidate text) returns boolean language sql stable security definer set search_path = '' as $$
  select not exists(select 1 from public.allowed_signup_domains)
      and not exists(select 1 from public.whitelisted_emails)
    or exists(select 1 from public.whitelisted_emails where email = lower(candidate))
    or exists(select 1 from public.allowed_signup_domains where split_part(lower(candidate),'@',2) = domain)
$$;
revoke all on function public.signup_email_allowed(text) from public;
grant execute on function public.signup_email_allowed(text) to authenticated;
create table public.images (
 id uuid primary key default gen_random_uuid(), url text not null, storage_path text unique, alt text not null, created_at timestamptz not null default now()
);
create table public.generation_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 chain_id uuid references public.prompt_chains(id) on delete set null, input text not null,
 status text not null default 'running' check(status in ('running','succeeded','failed')), error text,
 created_at timestamptz not null default now(), finished_at timestamptz
);
create table public.llm_responses (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.generation_requests(id) on delete cascade,
 step_id uuid references public.prompt_chain_steps(id) on delete set null, model text not null,
 prompt text not null, response text not null, latency_ms integer, usage jsonb, created_at timestamptz not null default now()
);
create table public.generated_media (
 id uuid primary key default gen_random_uuid(), request_id uuid references public.generation_requests(id) on delete set null,
 chain_id uuid references public.prompt_chains(id) on delete set null, content text not null, image_url text,
 created_at timestamptz not null default now()
);
create index on public.prompt_chain_steps(chain_id, position);
create index on public.generated_media(chain_id, created_at desc);
create index on public.llm_responses(request_id);
create index on public.generation_requests(created_at desc);

do $$ declare t text; begin
 foreach t in array array['llm_providers','llm_models','prompt_chains','prompt_chain_steps','prompt_chain_mix','terms','ai_generation_examples','allowed_signup_domains','whitelisted_emails','images','generation_requests','llm_responses','generated_media'] loop
 execute format('alter table public.%I enable row level security', t);
 execute format('alter table public.%I force row level security', t);
 execute format('drop policy if exists "Superadmin access" on public.%I', t);
 execute format('create policy "Superadmin access" on public.%I for all to authenticated using (public.is_superadmin()) with check (public.is_superadmin())', t);
 execute format('grant select, insert, update, delete on public.%I to authenticated', t);
 end loop;
end $$;
-- Store uploaded public-app images in the same inventory and capture successful public generations.
create or replace function public.observe_generation() returns trigger language plpgsql security definer set search_path = '' as $$
declare request_id uuid; begin
 insert into public.generation_requests(user_id,input,status,finished_at) values(new.user_id,new.prompt,'succeeded',now()) returning id into request_id;
 insert into public.llm_responses(request_id,model,prompt,response) values(request_id,new.model,new.generation_prompt,new.content);
 insert into public.generated_media(request_id,content,image_url) values(request_id,new.content,new.image_url);
 if new.image_url is not null then
 insert into public.images(url,alt,storage_path) values(new.image_url,coalesce(new.image_alt,''),case when new.image_source='upload' then split_part(new.image_url,'/object/public/meme-photos/',2) else null end) on conflict(storage_path) do nothing;
 end if;
 return new;
end $$;
drop trigger if exists observe_generation on public.generations;
create trigger observe_generation after insert on public.generations for each row execute function public.observe_generation();
insert into public.generated_media(content,image_url,created_at) select content,image_url,created_at from public.generations;
insert into public.images(url,alt,storage_path) select image_url,coalesce(image_alt,''),case when image_source='upload' then split_part(image_url,'/object/public/meme-photos/',2) else null end from public.generations where image_url is not null on conflict(storage_path) do nothing;
create policy "Superadmins manage meme storage" on storage.objects for all to authenticated using(bucket_id='meme-photos' and public.is_superadmin()) with check(bucket_id='meme-photos' and public.is_superadmin());

-- Serializes all ordering changes for a chain and rejects stale or incomplete lists.
create or replace function public.reorder_chain_steps(target_chain uuid, ordered_ids uuid[]) returns void language plpgsql security invoker set search_path = '' as $$
begin
 if not public.is_superadmin() then raise exception 'Forbidden'; end if;
 perform 1 from public.prompt_chains where id=target_chain for update;
 if cardinality(ordered_ids) <> (select count(*) from public.prompt_chain_steps where chain_id=target_chain)
 or cardinality(ordered_ids) <> (select count(distinct x) from unnest(ordered_ids) x)
 or exists(select 1 from unnest(ordered_ids) x where not exists(select 1 from public.prompt_chain_steps where id=x and chain_id=target_chain)) then raise exception 'Steps changed. Refresh and try again.'; end if;
 update public.prompt_chain_steps s set position = u.n - 1 from unnest(ordered_ids) with ordinality u(id,n) where s.id=u.id and s.chain_id=target_chain;
end $$;
revoke all on function public.reorder_chain_steps(uuid,uuid[]) from public;
grant execute on function public.reorder_chain_steps(uuid,uuid[]) to authenticated;
insert into public.llm_providers(name,api_kind) values('Google Gemini','gemini'),('OpenAI','openai');
insert into public.llm_models(provider_id,name,model_id) select id,'Gemini Flash Lite','gemini-3.1-flash-lite' from public.llm_providers where api_kind='gemini';
commit;
