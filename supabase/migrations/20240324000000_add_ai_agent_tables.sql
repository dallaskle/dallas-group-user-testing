-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create ai_docs table for storing embeddings
CREATE TABLE IF NOT EXISTS ai_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    embedding vector(1536),
    doc_type TEXT NOT NULL,
    content TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    validation_id UUID REFERENCES validations(id) ON DELETE CASCADE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent_audit_log table for logging agent interactions
CREATE TABLE IF NOT EXISTS agent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    user_input TEXT NOT NULL,
    agent_response TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    additional_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_docs_doc_type ON ai_docs(doc_type);
CREATE INDEX idx_ai_docs_project_id ON ai_docs(project_id);
CREATE INDEX idx_ai_docs_feature_id ON ai_docs(feature_id);
CREATE INDEX idx_ai_docs_ticket_id ON ai_docs(ticket_id);
CREATE INDEX idx_agent_audit_log_agent_name ON agent_audit_log(agent_name);
CREATE INDEX idx_agent_audit_log_user_id ON agent_audit_log(user_id);

-- Add updated_at trigger for ai_docs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_docs_updated_at
    BEFORE UPDATE ON ai_docs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 