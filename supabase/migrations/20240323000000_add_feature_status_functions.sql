-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS update_feature_status_testing_ticket ON testing_tickets;
DROP TRIGGER IF EXISTS update_feature_status_validation ON validations;
DROP FUNCTION IF EXISTS trigger_feature_status_on_testing_ticket();
DROP FUNCTION IF EXISTS trigger_feature_status_on_validation();
DROP FUNCTION IF EXISTS update_feature_status(UUID);

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
  v_successful_recent_validations INTEGER;
  v_new_status TEXT;
  v_old_status TEXT;
BEGIN
  -- Log function call
  RAISE NOTICE 'update_feature_status called for feature_id: %', p_feature_id;

  -- Get feature validation requirements
  SELECT 
    required_validations,
    current_validations,
    status
  INTO
    v_required_validations,
    v_current_validations,
    v_old_status
  FROM features
  WHERE id = p_feature_id;

  RAISE NOTICE 'Current state: required=%, current=%, old_status=%', 
    v_required_validations, v_current_validations, v_old_status;

  -- Check if feature has any assigned testers
  SELECT EXISTS (
    SELECT 1
    FROM testing_tickets tt
    JOIN tickets t ON t.id = tt.id
    WHERE tt.feature_id = p_feature_id
    AND t.status NOT IN ('resolved', 'closed')
  ) INTO v_has_testers;

  -- Count successful validations in the most recent {required_validations} tests
  SELECT COUNT(*)
  INTO v_successful_recent_validations
  FROM (
    SELECT status
    FROM validations
    WHERE feature_id = p_feature_id
    ORDER BY created_at DESC
    LIMIT v_required_validations
  ) recent_validations
  WHERE status = 'Working';

  RAISE NOTICE 'Validation check: successful_recent=%, has_testers=%',
    v_successful_recent_validations, v_has_testers;

  -- Determine new status
  IF v_current_validations = 0 AND NOT v_has_testers THEN
    v_new_status := 'Not Started';
  ELSIF v_current_validations >= v_required_validations AND v_successful_recent_validations = v_required_validations THEN
    v_new_status := 'Successful Test';
  ELSIF v_current_validations >= v_required_validations THEN
    v_new_status := 'Failed Test';
  ELSE
    v_new_status := 'In Progress';
  END IF;

  RAISE NOTICE 'Status change: % -> %', v_old_status, v_new_status;

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

-- Create triggers
CREATE TRIGGER update_feature_status_testing_ticket
  AFTER INSERT OR UPDATE OR DELETE ON testing_tickets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feature_status_on_testing_ticket();

CREATE TRIGGER update_feature_status_validation
  AFTER INSERT OR UPDATE OR DELETE ON validations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_feature_status_on_validation();

-- Add comments
COMMENT ON FUNCTION update_feature_status IS 'Updates feature status based on testing tickets and validations';
COMMENT ON FUNCTION trigger_feature_status_on_testing_ticket IS 'Triggers feature status update when testing tickets change';
COMMENT ON FUNCTION trigger_feature_status_on_validation IS 'Triggers feature status update when validations change'; 