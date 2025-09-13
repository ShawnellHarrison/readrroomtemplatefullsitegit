-- READ THE ROOM — Auth ↔ Profiles automation

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Auto-create profile & preferences when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_profiles (id, username, display_name, avatar_url, bio)
  values (
    new.id,
    split_part(coalesce(new.email, 'user_' || substr(new.id::text, 1, 8)), '@', 1),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''), '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    'New here 👋'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (id, user_id, theme, notifications_enabled, email_notifications, auto_share_votes, preferred_genres, privacy_level)
  values (
    gen_random_uuid(), new.id, 'dark', true, true, false, '[]'::jsonb, 'public'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RPC to ensure/patch own profile
create or replace function public.ensure_profile(
  p_display_name text default null,
  p_avatar_url text default null,
  p_bio text default null
)
returns public.user_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.user_profiles;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_profiles (id, username, display_name, avatar_url, bio)
  values (
    v_uid,
    'user_' || substr(v_uid::text, 1, 8),
    coalesce(p_display_name, 'User'),
    p_avatar_url,
    coalesce(p_bio, 'New here 👋')
  )
  on conflict (id) do update set
    display_name = coalesce(p_display_name, public.user_profiles.display_name),
    avatar_url   = coalesce(p_avatar_url, public.user_profiles.avatar_url),
    bio          = coalesce(p_bio, public.user_profiles.bio),
    updated_at   = now()
  returning * into v_row;

  return v_row;
end;
$$;