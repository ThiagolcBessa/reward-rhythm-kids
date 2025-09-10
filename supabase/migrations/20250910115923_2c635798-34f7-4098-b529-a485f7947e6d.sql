-- Create RPCs for reward redemption system

-- Function 1: Request reward redemption
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_kid_id uuid,
  p_reward_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_owner_uid uuid;
  kid_family_id uuid;
  reward_family_id uuid;
  kid_balance integer;
  reward_cost integer;
  reward_title text;
  new_redemption_id uuid;
  result jsonb;
BEGIN
  -- Security check: verify caller owns the kid's family
  SELECT k.family_id, f.owner_uid INTO kid_family_id, family_owner_uid
  FROM public.kid k
  JOIN public.family f ON f.id = k.family_id
  WHERE k.id = p_kid_id;
  
  IF family_owner_uid IS NULL OR family_owner_uid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You do not own this family';
  END IF;
  
  -- Check that reward belongs to the same family
  SELECT family_id, cost_points, title INTO reward_family_id, reward_cost, reward_title
  FROM public.reward
  WHERE id = p_reward_id AND active = true;
  
  IF reward_family_id IS NULL THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;
  
  IF reward_family_id != kid_family_id THEN
    RAISE EXCEPTION 'Reward does not belong to this family';
  END IF;
  
  -- Check kid's current balance
  SELECT public.get_kid_balance(p_kid_id) INTO kid_balance;
  
  IF kid_balance < reward_cost THEN
    RAISE EXCEPTION 'Insufficient points. Required: %, Available: %', reward_cost, kid_balance;
  END IF;
  
  -- Create pending redemption
  INSERT INTO public.redemption (
    kid_id,
    reward_id,
    status,
    requested_at,
    decided_at,
    decided_by,
    notes
  )
  VALUES (
    p_kid_id,
    p_reward_id,
    'pending',
    NOW(),
    NULL,
    NULL,
    NULL
  )
  RETURNING id INTO new_redemption_id;
  
  -- Build result with redemption details
  SELECT jsonb_build_object(
    'redemption_id', r.id,
    'kid_id', r.kid_id,
    'reward_id', r.reward_id,
    'reward_title', rw.title,
    'reward_cost', rw.cost_points,
    'status', r.status,
    'requested_at', r.requested_at,
    'kid_balance_before', kid_balance,
    'kid_balance_after', kid_balance -- No change until approved
  )
  INTO result
  FROM public.redemption r
  JOIN public.reward rw ON rw.id = r.reward_id
  WHERE r.id = new_redemption_id;
  
  RETURN result;
END;
$$;

-- Function 2: Decide on redemption request
CREATE OR REPLACE FUNCTION public.decide_redemption(
  p_redemption_id uuid,
  p_decision redemption_status
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_owner_uid uuid;
  redemption_record record;
  reward_record record;
  current_balance integer;
  result jsonb;
BEGIN
  -- Validate decision parameter
  IF p_decision NOT IN ('approved', 'rejected', 'delivered') THEN
    RAISE EXCEPTION 'Invalid decision. Must be "approved", "rejected", or "delivered"';
  END IF;
  
  -- Get redemption details with security check
  SELECT 
    r.id,
    r.kid_id,
    r.reward_id,
    r.status,
    r.requested_at,
    r.decided_at,
    r.decided_by,
    r.notes,
    f.owner_uid
  INTO redemption_record
  FROM public.redemption r
  JOIN public.kid k ON k.id = r.kid_id
  JOIN public.family f ON f.id = k.family_id
  WHERE r.id = p_redemption_id;
  
  -- Security check: verify caller owns the family
  IF redemption_record.owner_uid IS NULL OR redemption_record.owner_uid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You do not own this family';
  END IF;
  
  -- Get reward details
  SELECT title, cost_points INTO reward_record
  FROM public.reward
  WHERE id = redemption_record.reward_id;
  
  -- Handle different decisions
  IF p_decision = 'approved' THEN
    -- Check if already approved (prevent double-debiting)
    IF redemption_record.status = 'approved' THEN
      RAISE EXCEPTION 'Redemption already approved';
    END IF;
    
    -- Verify kid still has enough points
    SELECT public.get_kid_balance(redemption_record.kid_id) INTO current_balance;
    IF current_balance < reward_record.cost_points THEN
      RAISE EXCEPTION 'Insufficient points. Required: %, Available: %', reward_record.cost_points, current_balance;
    END IF;
    
    -- Debit points from kid's account
    INSERT INTO public.points_ledger (
      kid_id,
      ref_table,
      ref_id,
      entry_type,
      points,
      description
    )
    VALUES (
      redemption_record.kid_id,
      'redemption',
      p_redemption_id,
      'debit',
      reward_record.cost_points,
      'Redeem: ' || reward_record.title
    );
    
    -- Update redemption status
    UPDATE public.redemption 
    SET 
      status = 'approved',
      decided_at = NOW(),
      decided_by = auth.uid()
    WHERE id = p_redemption_id;
    
  ELSIF p_decision = 'rejected' THEN
    -- Simply update status and decision fields
    UPDATE public.redemption 
    SET 
      status = 'rejected',
      decided_at = COALESCE(decided_at, NOW()),
      decided_by = COALESCE(decided_by, auth.uid())
    WHERE id = p_redemption_id;
    
  ELSIF p_decision = 'delivered' THEN
    -- Update to delivered status (can only be done if approved first)
    IF redemption_record.status != 'approved' THEN
      RAISE EXCEPTION 'Can only mark approved redemptions as delivered';
    END IF;
    
    UPDATE public.redemption 
    SET 
      status = 'delivered',
      decided_at = COALESCE(decided_at, NOW()),
      decided_by = COALESCE(decided_by, auth.uid())
    WHERE id = p_redemption_id;
  END IF;
  
  -- Get updated redemption details and current balance
  SELECT public.get_kid_balance(redemption_record.kid_id) INTO current_balance;
  
  SELECT jsonb_build_object(
    'redemption_id', r.id,
    'kid_id', r.kid_id,
    'reward_id', r.reward_id,
    'reward_title', rw.title,
    'reward_cost', rw.cost_points,
    'status', r.status,
    'requested_at', r.requested_at,
    'decided_at', r.decided_at,
    'decided_by', r.decided_by,
    'notes', r.notes,
    'kid_current_balance', current_balance
  )
  INTO result
  FROM public.redemption r
  JOIN public.reward rw ON rw.id = r.reward_id
  WHERE r.id = p_redemption_id;
  
  RETURN result;
END;
$$;

-- Function 3: Get redemption history for a kid (helper function)
CREATE OR REPLACE FUNCTION public.get_kid_redemptions(p_kid_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  family_owner_uid uuid;
  result jsonb;
BEGIN
  -- Security check: verify caller owns the kid's family
  SELECT f.owner_uid INTO family_owner_uid
  FROM public.kid k
  JOIN public.family f ON f.id = k.family_id
  WHERE k.id = p_kid_id;
  
  IF family_owner_uid IS NULL OR family_owner_uid != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You do not own this family';
  END IF;
  
  -- Get redemption history
  SELECT jsonb_agg(
    jsonb_build_object(
      'redemption_id', r.id,
      'reward_title', rw.title,
      'reward_cost', rw.cost_points,
      'status', r.status,
      'requested_at', r.requested_at,
      'decided_at', r.decided_at,
      'notes', r.notes
    )
    ORDER BY r.requested_at DESC
  )
  INTO result
  FROM public.redemption r
  JOIN public.reward rw ON rw.id = r.reward_id
  WHERE r.kid_id = p_kid_id;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_redemption(uuid, redemption_status) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_kid_redemptions(uuid) TO authenticated;