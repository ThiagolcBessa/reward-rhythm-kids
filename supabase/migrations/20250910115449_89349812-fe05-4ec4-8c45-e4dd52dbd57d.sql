-- Add bonus and balance RPCs for Daily Task Kids

-- Function 1: Grant bonus for completing all tasks in a period
CREATE OR REPLACE FUNCTION public.grant_bonus(
  p_kid_id uuid,
  p_period text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_owner_uid uuid;
  bonus_points integer;
  period_identifier text;
  total_tasks integer := 0;
  completed_tasks integer := 0;
  bonus_description text;
  current_balance integer := 0;
BEGIN
  -- Validate period parameter
  IF p_period NOT IN ('daily', 'weekly') THEN
    RAISE EXCEPTION 'Invalid period. Must be "daily" or "weekly"';
  END IF;
  
  -- Security check: verify caller owns the family that owns this kid
  SELECT f.owner_uid INTO family_owner_uid
  FROM public.kid k
  JOIN public.family f ON f.id = k.family_id
  WHERE k.id = p_kid_id;
  
  IF family_owner_uid IS NULL OR family_owner_uid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You do not own this family';
  END IF;
  
  -- Set bonus amounts and period identifier
  IF p_period = 'daily' THEN
    bonus_points := 20;
    period_identifier := 'daily_bonus_' || CURRENT_DATE::text;
    bonus_description := 'Daily completion bonus for ' || CURRENT_DATE::text;
    
    -- Count tasks for today
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'done' THEN 1 END) as completed
    INTO total_tasks, completed_tasks
    FROM public.daily_task dt
    WHERE dt.kid_id = p_kid_id 
      AND dt.due_date = CURRENT_DATE;
      
  ELSIF p_period = 'weekly' THEN
    bonus_points := 50;
    period_identifier := 'weekly_bonus_' || EXTRACT(YEAR FROM CURRENT_DATE)::text || '_W' || EXTRACT(WEEK FROM CURRENT_DATE)::text;
    bonus_description := 'Weekly completion bonus for week ' || EXTRACT(WEEK FROM CURRENT_DATE)::text || '/' || EXTRACT(YEAR FROM CURRENT_DATE)::text;
    
    -- Count tasks for current ISO week
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'done' THEN 1 END) as completed
    INTO total_tasks, completed_tasks
    FROM public.daily_task dt
    WHERE dt.kid_id = p_kid_id 
      AND dt.due_date >= DATE_TRUNC('week', CURRENT_DATE)::date
      AND dt.due_date < (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days')::date;
  END IF;
  
  -- Check if there are any tasks for the period
  IF total_tasks = 0 THEN
    RAISE EXCEPTION 'No tasks found for this period';
  END IF;
  
  -- Check if all tasks are completed
  IF completed_tasks < total_tasks THEN
    RAISE EXCEPTION 'Not all tasks completed for this period. Completed: % of %', completed_tasks, total_tasks;
  END IF;
  
  -- Check if bonus already granted for this period (idempotency)
  IF EXISTS (
    SELECT 1 FROM public.points_ledger 
    WHERE kid_id = p_kid_id 
      AND entry_type = 'bonus'
      AND description LIKE '%' || period_identifier || '%'
  ) THEN
    RAISE EXCEPTION 'Bonus already granted for this period';
  END IF;
  
  -- Grant the bonus
  INSERT INTO public.points_ledger (
    kid_id,
    ref_table,
    ref_id,
    entry_type,
    points,
    description
  )
  VALUES (
    p_kid_id,
    'bonus_' || p_period,
    NULL, -- No specific reference ID for bonuses
    'bonus',
    bonus_points,
    bonus_description || ' (' || period_identifier || ')'
  );
  
  -- Calculate and return updated balance
  SELECT public.get_kid_points(p_kid_id) INTO current_balance;
  
  RETURN current_balance;
END;
$$;

-- Function 2: Get kid's current balance (alias for existing function with clearer name)
CREATE OR REPLACE FUNCTION public.get_kid_balance(p_kid_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reuse existing secure function
  RETURN public.get_kid_points(p_kid_id);
END;
$$;

-- Function 3: Check bonus eligibility without granting (helper function)
CREATE OR REPLACE FUNCTION public.check_bonus_eligibility(
  p_kid_id uuid,
  p_period text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_owner_uid uuid;
  total_tasks integer := 0;
  completed_tasks integer := 0;
  already_granted boolean := false;
  period_identifier text;
  result jsonb;
BEGIN
  -- Validate period parameter
  IF p_period NOT IN ('daily', 'weekly') THEN
    RAISE EXCEPTION 'Invalid period. Must be "daily" or "weekly"';
  END IF;
  
  -- Security check: verify caller owns the family that owns this kid
  SELECT f.owner_uid INTO family_owner_uid
  FROM public.kid k
  JOIN public.family f ON f.id = k.family_id
  WHERE k.id = p_kid_id;
  
  IF family_owner_uid IS NULL OR family_owner_uid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You do not own this family';
  END IF;
  
  -- Set period identifier and count tasks
  IF p_period = 'daily' THEN
    period_identifier := 'daily_bonus_' || CURRENT_DATE::text;
    
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'done' THEN 1 END) as completed
    INTO total_tasks, completed_tasks
    FROM public.daily_task dt
    WHERE dt.kid_id = p_kid_id 
      AND dt.due_date = CURRENT_DATE;
      
  ELSIF p_period = 'weekly' THEN
    period_identifier := 'weekly_bonus_' || EXTRACT(YEAR FROM CURRENT_DATE)::text || '_W' || EXTRACT(WEEK FROM CURRENT_DATE)::text;
    
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'done' THEN 1 END) as completed
    INTO total_tasks, completed_tasks
    FROM public.daily_task dt
    WHERE dt.kid_id = p_kid_id 
      AND dt.due_date >= DATE_TRUNC('week', CURRENT_DATE)::date
      AND dt.due_date < (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days')::date;
  END IF;
  
  -- Check if already granted
  SELECT EXISTS (
    SELECT 1 FROM public.points_ledger 
    WHERE kid_id = p_kid_id 
      AND entry_type = 'bonus'
      AND description LIKE '%' || period_identifier || '%'
  ) INTO already_granted;
  
  -- Build result
  result := jsonb_build_object(
    'period', p_period,
    'total_tasks', total_tasks,
    'completed_tasks', completed_tasks,
    'eligible', (total_tasks > 0 AND completed_tasks = total_tasks AND NOT already_granted),
    'already_granted', already_granted,
    'bonus_points', CASE WHEN p_period = 'daily' THEN 20 ELSE 50 END
  );
  
  RETURN result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.grant_bonus(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_kid_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_bonus_eligibility(uuid, text) TO authenticated;