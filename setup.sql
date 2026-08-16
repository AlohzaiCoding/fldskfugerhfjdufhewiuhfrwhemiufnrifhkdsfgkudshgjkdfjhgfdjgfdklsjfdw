create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  display_name text,
  avatar_url text default '',
  bio text default '',
  password_hash text default '',
  is_admin boolean default false,
  banned boolean default false,
  created_at timestamptz default now()
);

create table if not exists posts (
  id bigserial primary key,
  username text not null,
  body text not null,
  image_url text default '',
  video_url text default '',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table posts enable row level security;

drop policy if exists "read_profiles" on profiles;
drop policy if exists "insert_profiles" on profiles;
drop policy if exists "update_profiles" on profiles;
drop policy if exists "read_posts" on posts;
drop policy if exists "insert_posts" on posts;
drop policy if exists "update_posts" on posts;
drop policy if exists "delete_posts" on posts;

create policy "read_profiles" on profiles for select to public using (true);
create policy "insert_profiles" on profiles for insert to public with check (true);
create policy "update_profiles" on profiles for update to public using (true) with check (true);
create policy "read_posts" on posts for select to public using (true);
create policy "insert_posts" on posts for insert to public with check (true);
create policy "update_posts" on posts for update to public using (true) with check (true);
create policy "delete_posts" on posts for delete to public using (true);

-- password for both: euteamo123
insert into profiles (username, display_name, avatar_url, bio, password_hash, is_admin, banned)
values (
  'Tomodachi', 'Tomodachi', '', 'bryanbirth admin',
  '8ebb753750a13b2bce383961d6e3857e531229d9f65693b0480ca534b259cd71', true, false
) on conflict (username) do update set password_hash=excluded.password_hash, is_admin=true, banned=false;

insert into profiles (username, display_name, avatar_url, bio, password_hash, is_admin, banned)
values (
  'SprinkLOLZ!', 'SprinkLOLZ!', '', 'bryanbirth admin',
  '8ebb753750a13b2bce383961d6e3857e531229d9f65693b0480ca534b259cd71', true, false
) on conflict (username) do update set password_hash=excluded.password_hash, is_admin=true, banned=false;
