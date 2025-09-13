-- supabase/migrations/20250912_fix_votes_upsert.sql
-- PURPOSE: allow UPSERT on (room_id, session_id)

-- 1. Make sure columns exist and are NOT NULL
alter table public.votes
  alter column room_id set not null,
  alter column session_id set not null;

-- 2. Deduplicate existing rows (keep latest)
with ranked as (
  select ctid, room_id, session_id,
         row_number() over (partition by room_id, session_id order by created_at desc nulls last) as rn
  from public.votes
)
delete from public.votes v
using ranked r
where v.ctid = r.ctid and r.rn > 1;

-- 3. Add unique constraint/index for conflict target
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'votes_room_session_uniq'
  ) then
    create unique index votes_room_session_uniq
      on public.votes (room_id, session_id);
  end if;
end$$;

-- 4. Enable RLS and add permissive example policies (adjust to your needs)
alter table public.votes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='votes' and policyname='votes_insert_any'
  ) then
    create policy votes_insert_any
      on public.votes for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='votes' and policyname='votes_update_by_session'
  ) then
    create policy votes_update_by_session
      on public.votes for update
      to anon, authenticated
      using (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' or true)
      with check (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' or true);
  end if;
end$$;