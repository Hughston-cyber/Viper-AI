-- VIPER AI spectator accounts
-- Spectator invitations are separate from ordinary member invitations.
-- Spectators are approved on signup but can read only official race results and rider statistics.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['member','leadership','captain','spectator']::text[]));

alter table public.invite_codes
  add column if not exists code_type text not null default 'member';
alter table public.invite_codes drop constraint if exists invite_codes_code_type_check;
alter table public.invite_codes add constraint invite_codes_code_type_check
  check (code_type in ('member','spectator'));

create or replace function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $function$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and role <> 'spectator'
  );
$function$;

-- Use narrow views for spectators so notes and detailed lap entries cannot be fetched
-- directly from the underlying tables.
drop policy if exists "spectators read official race results" on public.race_records;
drop policy if exists "spectators read approved rider statistics" on public.rider_stats;

create or replace view public.spectator_race_results with (security_barrier = true) as
select r.event, r.race_date, r.result, r.laps
from public.race_records r
where exists (
  select 1 from public.profiles p
  where p.id = auth.uid() and p.status = 'approved' and p.role = 'spectator'
);

create or replace view public.spectator_rider_statistics with (security_barrier = true) as
select s.rider_name, s.event, s.laps
from public.rider_stats s
where exists (
  select 1 from public.profiles p
  where p.id = auth.uid() and p.status = 'approved' and p.role = 'spectator'
);

revoke all on public.spectator_race_results from public, anon;
revoke all on public.spectator_rider_statistics from public, anon;
grant select on public.spectator_race_results, public.spectator_rider_statistics to authenticated;

drop policy if exists "Approved members can read lap records" on public.lap_records;
create policy "Approved members can read lap records" on public.lap_records
  for select to authenticated using (
    exists (select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.status = 'approved'
        and p.role in ('member','leadership','captain'))
  );

-- The profile role is decided by the database from the code type, never by client-supplied role data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  is_cap boolean := lower(new.email) = lower('HughFletcher@caulfieldgs.vic.edu.au');
  requested_type text := case
    when new.raw_user_meta_data->>'account_type' = 'spectator' then 'spectator'
    else 'member'
  end;
  supplied_code text := new.raw_user_meta_data->>'invite_code';
begin
  if not is_cap and not exists (
    select 1 from public.invite_codes
    where lower(btrim(code)) = lower(btrim(supplied_code)) and active and code_type = requested_type
  ) then
    raise exception 'Invalid invitation code for requested account type';
  end if;

  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    case when is_cap then 'captain' when requested_type = 'spectator' then 'spectator' else 'member' end,
    case when is_cap or requested_type = 'spectator' then 'approved' else 'pending' end
  );
  return new;
end;
$function$;

grant select, insert, update, delete on public.invite_codes to authenticated;

-- Auth trigger invokes this function internally; do not expose it as a public RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;
