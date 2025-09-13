-- Lightweight analytics helpers

create or replace view public.v_room_vote_counts as
select
  r.id as room_id,
  r.title,
  count(v.id) as votes_count
from public.vote_rooms r
left join public.votes v on v.room_id = r.id
group by r.id;

create or replace view public.v_battle_vote_breakdown as
select
  b.id as battle_id,
  b.title,
  b.movie_a_id,
  b.movie_b_id,
  sum(case when v.movie_id = b.movie_a_id then 1 else 0 end) as votes_a,
  sum(case when v.movie_id = b.movie_b_id then 1 else 0 end) as votes_b,
  count(*) as total_votes
from public.movie_battles b
left join public.battle_votes v on v.battle_id = b.id
group by b.id;