-- Migration: staged transition from activities(int8) to exercises(uuid)
-- Run in Supabase SQL editor.

begin;

-- 1) Add new reference column for canonical exercise dictionary.
alter table public.workout_history
add column if not exists exercise_xid uuid;

-- 1b) Add workout date + update timestamp columns for clean OLTP history grouping.
alter table public.workout_history
add column if not exists performed_on date;

alter table public.workout_history
add column if not exists updated_at timestamptz not null default now();

-- Backfill performed_on from created_at for existing rows.
update public.workout_history
set performed_on = (created_at at time zone 'utc')::date
where performed_on is null;

-- 2) Add FK if it does not already exist.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_history_exercise_xid_fkey'
  ) then
    alter table public.workout_history
    add constraint workout_history_exercise_xid_fkey
    foreign key (exercise_xid) references public.exercises(id);
  end if;
end $$;

-- 3) Optional helper map table to validate name matching quality.
create table if not exists public.activity_exercise_map (
  activity_id bigint primary key references public.activities(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  matched_by text not null default 'exact_name'
);

-- 4) Populate mapping by exact case-insensitive name match.
insert into public.activity_exercise_map (activity_id, exercise_id, matched_by)
select a.id, e.id, 'exact_name'
from public.activities a
join public.exercises e
  on lower(trim(a.activity_name)) = lower(trim(e.name))
on conflict (activity_id) do nothing;

-- 5) Backfill workout_history rows from map.
update public.workout_history wh
set exercise_xid = m.exercise_id
from public.activity_exercise_map m
where wh.activity_xid = m.activity_id
  and wh.exercise_xid is null;

-- 6) Performance indexes for new access pattern.
create index if not exists idx_workout_history_exercise_xid
  on public.workout_history (exercise_xid);

create index if not exists idx_workout_history_user_created_at
  on public.workout_history (user_xid, created_at desc);

create index if not exists idx_workout_history_user_performed_on
  on public.workout_history (user_xid, performed_on desc);

commit;

-- Validation checks (run after migration):
-- select count(*) as rows_without_exercise from public.workout_history where exercise_xid is null;
-- select * from public.activities a left join public.activity_exercise_map m on m.activity_id = a.id where m.activity_id is null limit 50;
