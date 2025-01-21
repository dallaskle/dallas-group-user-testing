-- Create function to get a complete ticket by ID
CREATE OR REPLACE FUNCTION get_ticket_by_id(p_ticket_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Get the complete ticket information including related data
    SELECT 
        json_build_object(
            'ticket', t,
            'testingDetails', tt,
            'supportDetails', st,
            'assignedToUser', au,
            'createdByUser', cu
        ) INTO result
    FROM tickets t
    LEFT JOIN testing_tickets tt ON tt.id = t.id
    LEFT JOIN support_tickets st ON st.id = t.id
    LEFT JOIN users au ON au.id = t.assigned_to
    LEFT JOIN users cu ON cu.id = t.created_by
    WHERE t.id = p_ticket_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to list tickets with filtering and pagination
CREATE OR REPLACE FUNCTION list_tickets(
    p_type ticket_type DEFAULT NULL,
    p_status ticket_status DEFAULT NULL,
    p_priority ticket_priority DEFAULT NULL,
    p_assigned_to UUID DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    ticket_data JSON,
    total_count BIGINT
) AS $$
DECLARE
    v_offset INTEGER;
    v_where TEXT;
    v_query TEXT;
BEGIN
    -- Calculate offset
    v_offset := (p_page - 1) * p_limit;

    -- Build WHERE clause dynamically
    v_where := 'WHERE 1=1';
    IF p_type IS NOT NULL THEN
        v_where := v_where || ' AND t.type = ' || quote_literal(p_type);
    END IF;
    IF p_status IS NOT NULL THEN
        v_where := v_where || ' AND t.status = ' || quote_literal(p_status);
    END IF;
    IF p_priority IS NOT NULL THEN
        v_where := v_where || ' AND t.priority = ' || quote_literal(p_priority);
    END IF;
    IF p_assigned_to IS NOT NULL THEN
        v_where := v_where || ' AND t.assigned_to = ' || quote_literal(p_assigned_to);
    END IF;
    IF p_created_by IS NOT NULL THEN
        v_where := v_where || ' AND t.created_by = ' || quote_literal(p_created_by);
    END IF;

    -- Build and execute the query
    v_query := '
        WITH filtered_tickets AS (
            SELECT t.*
            FROM tickets t
            ' || v_where || '
        )
        SELECT 
            json_build_object(
                ''ticket'', t,
                ''testingDetails'', tt,
                ''supportDetails'', st,
                ''assignedToUser'', au,
                ''createdByUser'', cu
            ) as ticket_data,
            (SELECT COUNT(*) FROM filtered_tickets) as total_count
        FROM filtered_tickets t
        LEFT JOIN testing_tickets tt ON tt.id = t.id
        LEFT JOIN support_tickets st ON st.id = t.id
        LEFT JOIN users au ON au.id = t.assigned_to
        LEFT JOIN users cu ON cu.id = t.created_by
        ORDER BY t.created_at DESC
        LIMIT ' || p_limit || '
        OFFSET ' || v_offset;

    RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;

-- Create audit log table for ticket changes
CREATE TABLE ticket_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    changed_by UUID NOT NULL REFERENCES users(id),
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION log_ticket_changes()
RETURNS TRIGGER AS $$
DECLARE
    field_name TEXT;
    old_value TEXT;
    new_value TEXT;
BEGIN
    -- Check each field for changes
    IF TG_OP = 'UPDATE' THEN
        IF NEW.status <> OLD.status THEN
            INSERT INTO ticket_audit_log (ticket_id, changed_by, field_name, old_value, new_value)
            VALUES (NEW.id, auth.uid(), 'status', OLD.status::TEXT, NEW.status::TEXT);
        END IF;

        IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
            INSERT INTO ticket_audit_log (ticket_id, changed_by, field_name, old_value, new_value)
            VALUES (NEW.id, auth.uid(), 'assigned_to', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT);
        END IF;

        IF NEW.priority <> OLD.priority THEN
            INSERT INTO ticket_audit_log (ticket_id, changed_by, field_name, old_value, new_value)
            VALUES (NEW.id, auth.uid(), 'priority', OLD.priority::TEXT, NEW.priority::TEXT);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket changes
CREATE TRIGGER ticket_audit_trigger
    AFTER UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION log_ticket_changes();

-- Create indexes for better query performance
CREATE INDEX idx_ticket_audit_log_ticket_id ON ticket_audit_log(ticket_id);
CREATE INDEX idx_ticket_audit_log_changed_by ON ticket_audit_log(changed_by);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_composite ON tickets(type, status, priority);

-- Add comment explaining the functions
COMMENT ON FUNCTION get_ticket_by_id IS 'Gets a complete ticket by ID including all related information';
COMMENT ON FUNCTION list_tickets IS 'Lists tickets with filtering and pagination support';
COMMENT ON FUNCTION log_ticket_changes IS 'Logs changes to ticket fields for audit purposes'; 