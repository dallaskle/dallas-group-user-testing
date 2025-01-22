-- Create a function to increment feature validations
CREATE OR REPLACE FUNCTION public.increment_feature_validations(p_feature_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE features
  SET current_validations = current_validations + 1
  WHERE id = p_feature_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_feature_validations(uuid) TO authenticated; 