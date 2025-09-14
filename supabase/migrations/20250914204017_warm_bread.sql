/*
  # Add RLS Policies for Battles and Votes

  This migration adds Row Level Security policies to allow:
  1. Public read access to battles
  2. Public read and write access to battle_votes (for anonymous voting)

  ## Security
  - battles: readable by everyone
  - battle_votes: readable and writable by everyone (anonymous voting support)
*/

-- battles readable by everyone
create policy battles_select on public.battles
for select to anon, authenticated using (true);

-- battle_votes readable & writable by everyone (for anonymous voting)
create policy battle_votes_select on public.battle_votes
for select to anon, authenticated using (true);

create policy battle_votes_insert on public.battle_votes
for insert to anon, authenticated with check (true);