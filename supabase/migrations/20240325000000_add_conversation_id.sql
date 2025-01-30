-- Add conversation_id column to agent_audit_log table
ALTER TABLE agent_audit_log 
ADD COLUMN conversation_id UUID;

-- Add index for better query performance
CREATE INDEX idx_agent_audit_log_conversation_id 
ON agent_audit_log(conversation_id);
