-- Create ticket type enum
CREATE TYPE ticket_type AS ENUM ('testing', 'support', 'question');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE support_category AS ENUM ('project', 'feature', 'testing', 'other');

-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type ticket_type NOT NULL,
    status ticket_status NOT NULL DEFAULT 'open',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'medium',
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create testing_tickets table
CREATE TABLE testing_tickets (
    id UUID PRIMARY KEY REFERENCES tickets(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    validation_id UUID REFERENCES validations(id),
    deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY REFERENCES tickets(id) ON DELETE CASCADE,
    category support_category NOT NULL,
    project_id UUID REFERENCES projects(id),
    feature_id UUID REFERENCES features(id),
    ai_response TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_testing_tickets_feature ON testing_tickets(feature_id);
CREATE INDEX idx_testing_tickets_validation ON testing_tickets(validation_id);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_project ON support_tickets(project_id);
CREATE INDEX idx_support_tickets_feature ON support_tickets(feature_id);

-- Create updated_at triggers
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testing_tickets_updated_at
    BEFORE UPDATE ON testing_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();