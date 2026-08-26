-- Budget app schema.
-- Every table carries user_id and is locked down with row-level security so a
-- user can only ever see or touch their own rows, even if application code
-- has a bug. The service-role key (used only by the server-side cron job)
-- bypasses RLS by design.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  icon text not null default 'tag',
  is_income boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.categories enable row level security;

create policy "categories_all_own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  occurred_on date not null default current_date,
  note text,
  source text not null default 'manual' check (source in ('manual', 'import')),
  created_at timestamptz not null default now()
);

create index expenses_user_date_idx on public.expenses (user_id, occurred_on desc);

alter table public.expenses enable row level security;

create policy "expenses_all_own" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- budgets: one row per user/category/month. category_id null = overall budget.
-- ---------------------------------------------------------------------------
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete cascade,
  month date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

-- unique() treats NULLs as distinct, so the per-category constraint above
-- does not stop duplicate overall (category_id is null) budgets per month.
create unique index budgets_overall_unique on public.budgets (user_id, month)
  where category_id is null;

alter table public.budgets enable row level security;

create policy "budgets_all_own" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  saved_amount numeric(12, 2) not null default 0 check (saved_amount >= 0),
  target_date date,
  priority int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  amount numeric(12, 2) not null,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.goal_contributions enable row level security;

create policy "goal_contributions_all_own" on public.goal_contributions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- recurring_bills: reserved money the daily-allowance engine must set aside
-- ---------------------------------------------------------------------------
create table public.recurring_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  due_day int not null check (due_day between 1 and 28),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recurring_bills enable row level security;

create policy "recurring_bills_all_own" on public.recurring_bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- alert_settings / alert_log
-- ---------------------------------------------------------------------------
create table public.alert_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  daily_digest boolean not null default false,
  overspend_alerts boolean not null default true,
  overspend_threshold_pct numeric(5, 2) not null default 110,
  low_allowance_threshold numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.alert_settings enable row level security;

create policy "alert_settings_all_own" on public.alert_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.alert_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  alert_type text not null,
  sent_at timestamptz not null default now(),
  details jsonb
);

-- one alert of a given type per user per day, so the cron job never double-sends
-- (cast anchored to UTC, not the session timezone, so it qualifies as immutable)
create unique index alert_log_dedupe on public.alert_log (
  user_id, alert_type, ((sent_at at time zone 'utc')::date)
);

alter table public.alert_log enable row level security;

create policy "alert_log_select_own" on public.alert_log
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- New-user bootstrap: profile row, default alert settings, starter categories
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.alert_settings (user_id, email)
  values (new.id, new.email);

  insert into public.categories (user_id, name, color, icon) values
    (new.id, 'Food', '#f97316', 'utensils'),
    (new.id, 'Transport', '#3b82f6', 'car'),
    (new.id, 'Housing', '#8b5cf6', 'home'),
    (new.id, 'Utilities', '#06b6d4', 'zap'),
    (new.id, 'Entertainment', '#ec4899', 'film'),
    (new.id, 'Health', '#10b981', 'heart-pulse'),
    (new.id, 'Shopping', '#eab308', 'shopping-bag'),
    (new.id, 'Other', '#6b7280', 'more-horizontal');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
