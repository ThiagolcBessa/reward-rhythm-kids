-- Create secure RPC functions for Daily Task Kids

-- Function 1: Generate daily tasks for a family
CREATE OR REPLACE FUNCTION public.generate_today_tasks(
  p_family_id uuid,
  p_target_date date DEFAULT CURRENT_DATE
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_count integer := 0;
  family_owner_uid uuid;
BEGIN
  -- Security check: verify caller owns the family
  SELECT owner_uid INTO family_owner_uid 
  FROM public.family 
  WHERE id = p_family_id;
  
  IF family_owner_uid IS NULL OR family_owner_uid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You do not own this family';
  END IF;
  
  -- Generate daily tasks for all kids and active templates
  WITH new_tasks AS (
    INSERT INTO public.daily_task (kid_id, task_template_id, due_date, status, points_awarded)
    SELECT 
      k.id as kid_id,
      tt.id as task_template_id,
      p_target_date as due_date,
      'pending' as status,
      NULL as points_awarded
    FROM public.kid k
    CROSS JOIN public.task_template tt
    WHERE k.family_id = p_family_id
      AND tt.family_id = p_family_id
      AND tt.active = true
    ON CONFLICT (kid_id, task_template_id, due_date) DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO task_count FROM new_tasks;
  
  RETURN task_count;
END;
$$;

-- Function 2: Complete a daily task
CREATE OR REPLACE FUNCTION public.complete_task(p_daily_task_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_record record;
  family_owner_uid uuid;
  current_points integer := 0;
  awarded_points integer;
  task_title text;
BEGIN
  -- Get task details with security check
  SELECT 
    dt.id,
    dt.kid_id,
    dt.task_template_id,
    dt.status,
    tt.base_points,
    tt.title,
    f.owner_uid
  INTO task_record
  FROM public.daily_task dt
  JOIN public.task_template tt ON tt.id = dt.task_template_id
  JOIN public.kid k ON k.id = dt.kid_id
  JOIN public.family f ON f.id = k.family_id
  WHERE dt.id = p_daily_task_id;
  
  -- Security check: verify caller owns the family
  IF task_record.owner_uid IS NULL OR task_record.owner_uid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You do not own this family';
  END IF;
  
  -- Check if task is already completed
  IF task_record.status = 'done' THEN
    RAISE EXCEPTION 'Task is already completed';
  END IF;
  
  -- Update the daily task
  awarded_points := task_record.base_points;
  task_title := task_record.title;
  
  UPDATE public.daily_task 
  SET 
    status = 'done',
    points_awarded = awarded_points
  WHERE id = p_daily_task_id;
  
  -- Insert completion record
  INSERT INTO public.completion (daily_task_id, kid_id, completed_at)
  VALUES (p_daily_task_id, task_record.kid_id, NOW());
  
  -- Insert credit into points ledger
  INSERT INTO public.points_ledger (
    kid_id,
    ref_table,
    ref_id,
    entry_type,
    points,
    description
  )
  VALUES (
    task_record.kid_id,
    'daily_task',
    p_daily_task_id,
    'credit',
    awarded_points,
    'Completed: ' || task_title
  );
  
  -- Calculate and return updated points balance
  SELECT COALESCE(SUM(
    CASE 
      WHEN entry_type = 'credit' OR entry_type = 'bonus' THEN points
      WHEN entry_type = 'debit' THEN -points
      ELSE 0
    END
  ), 0)
  INTO current_points
  FROM public.points_ledger
  WHERE kid_id = task_record.kid_id;
  
  RETURN current_points;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_today_tasks(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_task(uuid) TO authenticated;

-- Create helper function to get kid's current points balance
CREATE OR REPLACE FUNCTION public.get_kid_points(p_kid_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_owner_uid uuid;
  points_balance integer := 0;
BEGIN
  -- Security check: verify caller owns the family that owns this kid
  SELECT f.owner_uid INTO family_owner_uid
  FROM public.kid k
  JOIN public.family f ON f.id = k.family_id
  WHERE k.id = p_kid_id;
  
  IF family_owner_uid IS NULL OR family_owner_uid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You do not own this family';
  END IF;
  
  -- Calculate points balance
  SELECT COALESCE(SUM(
    CASE 
      WHEN entry_type = 'credit' OR entry_type = 'bonus' THEN points
      WHEN entry_type = 'debit' THEN -points
      ELSE 0
    END
  ), 0)
  INTO points_balance
  FROM public.points_ledger
  WHERE kid_id = p_kid_id;
  
  RETURN points_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_kid_points(uuid) TO authenticated;