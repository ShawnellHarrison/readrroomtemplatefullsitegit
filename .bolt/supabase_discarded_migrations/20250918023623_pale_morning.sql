/*
# Fix Schema Mismatches and Missing Functions

This migration creates the missing database functions that your triggers reference
and ensures all table references are consistent.

## Missing Functions Created
- `set_updated_at()` - Updates updated_at timestamp
- `bump_battle_vote_count()` - Updates vote counts
- `validate_battle_vote_movie()` - Validates movie votes

## Schema Alignment
- Ensures all hooks use existing tables (vote_rooms, votes)
- Movie battles stored as special vote_rooms with type='movie_battle'
*/

-- Create missing trigger functions to prevent errors
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  if tg_op in ('INSERT','UPDATE') then
    if exists (select 1 from information_schema.columns 
               where table_schema = tg_table_schema and table_name = tg_table_name and column_name = 'updated_at') then
      new.updated_at := now();
    end if;
  end if;
  return new;
end $$;

create or replace function public.bump_battle_vote_count()
returns trigger language plpgsql as $$
begin
  -- Update vote counts for movie battles
  if tg_op = 'INSERT' then
    -- Increment total_votes if the column exists
    if exists (select 1 from information_schema.columns 
               where table_schema = 'public' and table_name = 'vote_rooms' and column_name = 'total_votes') then
      update public.vote_rooms 
      set total_votes = coalesce(total_votes, 0) + 1 
      where id = new.room_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    -- Decrement total_votes if the column exists
    if exists (select 1 from information_schema.columns 
               where table_schema = 'public' and table_name = 'vote_rooms' and column_name = 'total_votes') then
      update public.vote_rooms 
      set total_votes = greatest(coalesce(total_votes, 0) - 1, 0) 
      where id = old.room_id;
    end if;
    return old;
  end if;
  return null;
end $$;

create or replace function public.validate_battle_vote_movie()
returns trigger language plpgsql as $$
begin
  -- Validate that movieId in vote matches one of the movies in the room's items
  if new.value ? 'movieId' then
    declare
      room_items jsonb;
      movie_id_valid boolean := false;
    begin
      select items into room_items 
      from public.vote_rooms 
      where id = new.room_id and type = 'movie_battle';
      
      if room_items is not null then
        -- Check if movieId matches any movie in the items array
        select exists(
          select 1 from jsonb_array_elements(room_items) as movie
          where (movie->>'id')::int = (new.value->>'movieId')::int
        ) into movie_id_valid;
        
        if not movie_id_valid then
          raise exception 'Invalid movie ID for this battle';
        end if;
      end if;
    end;
  end if;
  return new;
end $$;

-- Add total_votes column to vote_rooms if it doesn't exist
alter table public.vote_rooms 
add column if not exists total_votes integer default 0;

-- Create index for better performance
create index if not exists idx_vote_rooms_type on public.vote_rooms(type);
create index if not exists idx_votes_value_gin on public.votes using gin(value);

-- Update existing vote_rooms to have correct total_votes
update public.vote_rooms 
set total_votes = (
  select count(*) 
  from public.votes 
  where votes.room_id = vote_rooms.id
)
where total_votes is null or total_votes = 0;