-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ticket_audit_trigger ON tickets;
DROP FUNCTION IF EXISTS log_ticket_changes();

-- Recreate trigger function with session_user parameter
CREATE OR REPLACE FUNCTION log_ticket_changes()
RETURNS TRIGGER AS $$
DECLARE
    field_name TEXT;
    old_value TEXT;
    new_value TEXT;
    v_changed_by UUID;
BEGIN
    -- Get the session user, fallback to auth.uid() if not set
    v_changed_by := COALESCE(current_setting('app.current_user_id', TRUE)::UUID, auth.uid());
    
    -- Check each field for changes
    IF TG_OP = 'UPDATE' THEN
        IF NEW.status <> OLD.status THEN
            INSERT INTO ticket_audit_log (ticket_id, changed_by, field_name, old_value, new_value)
            VALUES (NEW.id, v_changed_by, 'status', OLD.status::TEXT, NEW.status::TEXT);
        END IF;

        IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
            INSERT INTO ticket_audit_log (ticket_id, changed_by, field_name, old_value, new_value)
            VALUES (NEW.id, v_changed_by, 'assigned_to', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT);
        END IF;

        IF NEW.priority <> OLD.priority THEN
            INSERT INTO ticket_audit_log (ticket_id, changed_by, field_name, old_value, new_value)
            VALUES (NEW.id, v_changed_by, 'priority', OLD.priority::TEXT, NEW.priority::TEXT);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER ticket_audit_trigger
    AFTER UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION log_ticket_changes();

-- Add comment explaining the change
COMMENT ON FUNCTION log_ticket_changes IS 'Logs changes to ticket fields for audit purposes using session user ID or auth.uid() as fallback'; 