/*
  # Add vote_rooms compatibility view

  This migration creates a backward-compatible view that maps the old vote_rooms API 
  to the new battles table structure, allowing existing frontend code to work without changes.

  1. New Tables
    - Ensures `battles` table exists with proper structure
    - Adds RLS policies for public access

  2. Compatibility View
    - Creates `vote_rooms` view that maps to `battles` table
    - Transforms `battle_type` to `type` field (e.g., 'food' -> 'food_battle')
    - Preserves all existing API endpoints and filters

  3. Security
    - Enable RLS on battles table
    - Add policy for public reads of all battles
    - View inherits security from underlying table
*/

-- ✅ One-shot fix for your 404: keep your old endpoint working by creating a
--    BACKCOMPAT VIEW named public.vote_rooms that maps to the new `battles` table.
--    After this, your existing fetch to /rest/v1/vote_rooms?... will work.

-- 0) Safety: required extension for UUIDs (usually already enabled)
create extension if not exists "pgcrypto";

-- 1) Ensure the new universal table exists (skip if you already created it)
create table if not exists public.battles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  battle_type text not null check (battle_type in ('movie','book','game','music','food')),
  item_a jsonb not null,
  item_b jsonb not null,
  ends_at timestamptz,
  created_at timestamptz default now(),
  is_active boolean default true,
  total_votes int default 0
);

-- 2) RLS for battles (required so the view can be selected by anon/auth)
alter table public.battles enable row level security;

-- Remove old conflicting policies if they exist (safe to run repeatedly)
drop policy if exists "battles_public_select" on public.battles;

-- Allow public reads of active/inactive battles (adjust if you want to restrict)
create policy "battles_public_select"
  on public.battles
  for select
  to anon, authenticated
  using (true);

-- 3) Create a compatibility VIEW that looks like your OLD `vote_rooms` table
--    It exposes a column named `type` (as your client expects) and preserves your
--    filter values like `food_battle` by computing: type = battle_type || '_battle'
drop view if exists public.vote_rooms;

create view public.vote_rooms
as
select
  b.id,
  b.title,
  b.description,
  (b.battle_type || '_battle')::text as type,  -- ← keeps your existing filter 'food_battle'
  b.is_active,
  b.created_at,
  b.ends_at,
  b.total_votes,
  b.item_a,
  b.item_b,
  -- Add missing columns that existing code expects
  null::text as category,
  b.item_a || b.item_b as items,  -- Combine items for compatibility
  null::int as scale_min,
  null::int as scale_max,
  b.ends_at as deadline,
  b.ends_at as expires_at,
  null::text as created_by,
  null::uuid as user_id
from public.battles b;

comment on view public.vote_rooms is
  'Back-compat view mapping old vote_rooms API to new battles schema. `type` is battle_type||_battle';

-- 4) Add indexes for performance
create index if not exists idx_battles_type_active_created
  on public.battles (battle_type, is_active, created_at desc);

create index if not exists idx_battles_active_created
  on public.battles (is_active, created_at desc);

-- 5) Quick sanity query you can run in the SQL editor after this migration:
-- select * from public.vote_rooms where type = 'food_battle' and is_active is true order by created_at desc;