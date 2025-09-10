-- Create base schema for Daily Task Kids
-- Entities: family, kid, task_template, daily_task, completion, reward, redemption, points_ledger

create extension if not exists "uuid-ossp";

create table public.family (
  id uuid primary key default uuid_generate_v4(),
  owner_uid uuid not null,
  name text not null,
  created_at timestamptz default now()
);

create table public.kid (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.family(id) on delete cascade,
  display_name text not null,
  age int,
  avatar_url text,
  color_hex text,
  created_at timestamptz default now()
);

create type recurrence as enum ('daily','weekly','once');

create table public.task_template (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.family(id) on delete cascade,
  title text not null,
  description text,
  base_points int not null check (base_points in (5,10,15)),
  recurrence recurrence not null default 'daily',
  active boolean not null default true,
  icon_emoji text,
  created_at timestamptz default now()
);

create table public.daily_task (
  id uuid primary key default uuid_generate_v4(),
  kid_id uuid not null references public.kid(id) on delete cascade,
  task_template_id uuid not null references public.task_template(id),
  due_date date not null,
  status text not null default 'pending',
  points_awarded int,
  created_at timestamptz default now(),
  unique (kid_id, task_template_id, due_date)
);

create table public.completion (
  id uuid primary key default uuid_generate_v4(),
  daily_task_id uuid not null references public.daily_task(id) on delete cascade,
  kid_id uuid not null references public.kid(id) on delete cascade,
  completed_at timestamptz not null default now()
);

create table public.reward (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.family(id) on delete cascade,
  title text not null,
  cost_points int not null check (cost_points > 0),
  description text,
  active boolean not null default true,
  icon_emoji text,
  created_at timestamptz default now()
);

create type redemption_status as enum ('pending','approved','rejected','delivered');

create table public.redemption (
  id uuid primary key default uuid_generate_v4(),
  kid_id uuid not null references public.kid(id) on delete cascade,
  reward_id uuid not null references public.reward(id),
  status redemption_status not null default 'pending',
  requested_at timestamptz default now(),
  decided_at timestamptz,
  decided_by uuid,
  notes text
);

create type ledger_type as enum ('credit','debit','bonus');

create table public.points_ledger (
  id uuid primary key default uuid_generate_v4(),
  kid_id uuid not null references public.kid(id) on delete cascade,
  ref_table text,
  ref_id uuid,
  entry_type ledger_type not null,
  points int not null,
  description text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.family ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

-- Family table policies: Direct owner_uid check
CREATE POLICY "Family owners can select their own family" ON public.family
FOR SELECT USING (auth.uid() = owner_uid);

CREATE POLICY "Family owners can insert their own family" ON public.family
FOR INSERT WITH CHECK (auth.uid() = owner_uid);

CREATE POLICY "Family owners can update their own family" ON public.family
FOR UPDATE USING (auth.uid() = owner_uid);

CREATE POLICY "Family owners can delete their own family" ON public.family
FOR DELETE USING (auth.uid() = owner_uid);

-- Kid table policies: Via family_id -> family.owner_uid
CREATE POLICY "Family owners can select their kids" ON public.kid
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = kid.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can insert kids to their family" ON public.kid
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = kid.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can update their kids" ON public.kid
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = kid.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can delete their kids" ON public.kid
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = kid.family_id 
    AND family.owner_uid = auth.uid()
  )
);

-- Task template policies: Via family_id -> family.owner_uid
CREATE POLICY "Family owners can select their task templates" ON public.task_template
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = task_template.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can insert task templates to their family" ON public.task_template
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = task_template.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can update their task templates" ON public.task_template
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = task_template.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can delete their task templates" ON public.task_template
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = task_template.family_id 
    AND family.owner_uid = auth.uid()
  )
);

-- Reward policies: Via family_id -> family.owner_uid
CREATE POLICY "Family owners can select their rewards" ON public.reward
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = reward.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can insert rewards to their family" ON public.reward
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = reward.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can update their rewards" ON public.reward
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = reward.family_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can delete their rewards" ON public.reward
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.family 
    WHERE family.id = reward.family_id 
    AND family.owner_uid = auth.uid()
  )
);

-- Daily task policies: Via kid_id -> kid.family_id -> family.owner_uid
CREATE POLICY "Family owners can select their daily tasks" ON public.daily_task
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = daily_task.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can insert daily tasks for their kids" ON public.daily_task
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = daily_task.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can update their daily tasks" ON public.daily_task
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = daily_task.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can delete their daily tasks" ON public.daily_task
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = daily_task.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

-- Completion policies: Via kid_id -> kid.family_id -> family.owner_uid
CREATE POLICY "Family owners can select their completions" ON public.completion
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = completion.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can insert completions for their kids" ON public.completion
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = completion.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can update their completions" ON public.completion
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = completion.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can delete their completions" ON public.completion
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = completion.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

-- Redemption policies: Via kid_id -> kid.family_id -> family.owner_uid
CREATE POLICY "Family owners can select their redemptions" ON public.redemption
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = redemption.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can insert redemptions for their kids" ON public.redemption
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = redemption.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can update their redemptions" ON public.redemption
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = redemption.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can delete their redemptions" ON public.redemption
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = redemption.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

-- Points ledger policies: Via kid_id -> kid.family_id -> family.owner_uid
CREATE POLICY "Family owners can select their points ledger" ON public.points_ledger
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = points_ledger.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can insert points ledger for their kids" ON public.points_ledger
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = points_ledger.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can update their points ledger" ON public.points_ledger
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = points_ledger.kid_id 
    AND family.owner_uid = auth.uid()
  )
);

CREATE POLICY "Family owners can delete their points ledger" ON public.points_ledger
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.kid 
    JOIN public.family ON family.id = kid.family_id
    WHERE kid.id = points_ledger.kid_id 
    AND family.owner_uid = auth.uid()
  )
);