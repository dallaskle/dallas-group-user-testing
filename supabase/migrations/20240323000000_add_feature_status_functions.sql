-- Function to update feature status
CREATE OR REPLACE FUNCTION update_feature_status(p_feature_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_testers BOOLEAN;
  v_required_validations INTEGER;
  v_current_validations INTEGER;
  v_has_failed_tests BOOLEAN;
  v_new_status TEXT;
BEGIN
  -- Get feature validation requirements
  SELECT 
    required_validations,
    current_validations
  INTO
    v_required_validations,
    v_current_validations
  FROM features
  WHERE id = p_feature_id;

  -- Check if feature has any assigned testers
  SELECT EXISTS (
    SELECT 1
    FROM testing_tickets tt
    JOIN tickets t ON t.id = tt.id
    WHERE tt.feature_id = p_feature_id
    AND t.status NOT IN ('resolved', 'closed')
  ) INTO v_has_testers;

  -- Check if feature has any failed tests in the last {required_validations} tests
  SELECT EXISTS (
    SELECT 1
    FROM (
      SELECT status
      FROM validations
      WHERE feature_id = p_feature_id
      ORDER BY created_at DESC
      LIMIT v_required_validations
    ) recent_validations
    WHERE status = 'Needs Fixing'
  ) INTO v_has_failed_tests;

  -- Determine new status
  IF v_current_validations = 0 AND NOT v_has_testers THEN
    v_new_status := 'Not Started';
  ELSIF v_current_validations >= v_required_validations THEN
    IF v_has_failed_tests THEN
      v_new_status := 'Failed Test';
    ELSE
      v_new_status := 'Successful Test';
    END IF;
  ELSE
    v_new_status := 'In Progress';
  END IF;

  -- Update feature status
  UPDATE features
  SET status = v_new_status
  WHERE id = p_feature_id;
END;
$$;

-- Trigger for testing ticket changes
CREATE OR REPLACE FUNCTION trigger_feature_status_on_testing_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_feature_status(NEW.feature_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_feature_status(OLD.feature_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_feature_status_testing_ticket
  AFTER INSERT OR UPDATE OR DELETE ON testing_tickets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feature_status_on_testing_ticket();

-- Trigger for validation changes
CREATE OR REPLACE FUNCTION trigger_feature_status_on_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_feature_status(NEW.feature_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_feature_status(OLD.feature_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_feature_status_validation
  AFTER INSERT OR UPDATE OR DELETE ON validations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feature_status_on_validation();

-- Add comments
COMMENT ON FUNCTION update_feature_status IS 'Updates feature status based on testing tickets and validations';
COMMENT ON FUNCTION trigger_feature_status_on_testing_ticket IS 'Triggers feature status update when testing tickets change';
COMMENT ON FUNCTION trigger_feature_status_on_validation IS 'Triggers feature status update when validations change'; 