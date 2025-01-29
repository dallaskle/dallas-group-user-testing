-- Create a function to match documents based on embedding similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  doc_type text,
  project_id uuid,
  feature_id uuid,
  ticket_id uuid,
  validation_id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_docs.id,
    ai_docs.content,
    ai_docs.metadata,
    ai_docs.doc_type,
    ai_docs.project_id,
    ai_docs.feature_id,
    ai_docs.ticket_id,
    ai_docs.validation_id,
    1 - (ai_docs.embedding <=> query_embedding) as similarity
  FROM ai_docs
  WHERE 1 - (ai_docs.embedding <=> query_embedding) > match_threshold
  ORDER BY ai_docs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create an index on the embedding column for faster similarity search
CREATE INDEX IF NOT EXISTS ai_docs_embedding_idx ON ai_docs
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); 