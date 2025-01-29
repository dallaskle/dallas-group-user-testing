# AI Agent Implementation Plan

Below is a comprehensive plan for creating a LangChain-based AI agent with Supabase, pgvector, and Langsmith observability, alongside your existing codebase. This outlines both backend (Supabase Edge Functions) and frontend (React/Vite/Tailwind) steps. The plan should be sufficiently detailed so that a developer can implement it without further clarifications.

---

## 1. CONTEXT & GOAL

We want to build a "student-ai-agent" responsible for AI-driven actions (e.g., "Add a new feature to my project") in a chat-like interface. In the future, we can similarly create "admin-ai-agent" or "tester-ai-agent." Each will have edge functions with specialized tools. The agent can decide which tool to invoke (e.g., creating a feature, updating a feature, storing documents) based on user input.

### Key Technologies & Integrations

1. Supabase + pgvector for embeddings (already enabled).  
2. Langsmith for observability (monitor queries/results).  
3. OpenAI as the LLM provider.  
4. React/Vite/Tailwind frontend using Zustand and supabase-js for auth and DB interactions.

### Relevant Existing Files & Folders

• docs/v2/initial-agent-plan.md: This document (planning file).  
• src/database.types.ts: Database schema definitions.  
• supabase/functions/_shared/database.types.ts: Edge function schema definitions.  
• supabase/functions/student-create-feature/index.ts: Existing edge function to create features for a project.  
• src/features/student/api/projects.api.ts: Frontend API logic for student project & feature management.  
• src/App.tsx: Main React Router setup.  

---

## 2. DATABASE STRUCTURE

### 2.1 ai_docs Table

We will create or adjust the "ai_docs" table to store embeddings, with columns:

  CREATE TABLE IF NOT EXISTS ai_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    embedding VECTOR(1536),
    doc_type TEXT,          -- e.g. "PRD", "feature", "ticket", "validation_log"
    content TEXT,
    project_id UUID,
    feature_id UUID,
    ticket_id UUID,
    validation_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT now()
  );

This table allows storing chunked text (content) with associated embeddings (VECTOR(1536)). The dimension 1536 corresponds to the default OpenAI embedding size; adjust if using a different model.

### 2.2 agent_audit_log Table

We will also create a table "agent_audit_log" to capture conversation or usage info for the agent. Columns (example):

  CREATE TABLE IF NOT EXISTS agent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,       -- e.g., "student-ai-agent"
    user_input TEXT,                -- raw user query
    agent_response TEXT,            -- response from the agent
    additional_metadata JSONB,      -- optional chain-of-thought or debug data
    created_at TIMESTAMP DEFAULT now()
  );

This enables robust logging and an auditable trail of how the agent is interacting with the rest of the system. You can retrieve this log in the frontend to display reasons behind the agent's decisions or to debug.

---

## 3. BACKEND ARCHITECTURE

### 3.1 Creating a "student-ai-agent" Edge Function

Location: supabase/functions/student-ai-agent/index.ts

Responsibilities:  
• Handle POST requests from the React frontend.  
• Parse user requests (e.g., "Add a new feature").  
• Perform a similarity search on the vector database to identify the correct project and feature IDs based on the natural language request.  
• Possibly generate embeddings or run an LLM chain.  
• Store records in "ai_docs."  
• Invoke specialized tools to create, update, or retrieve features, etc.  
• Log details in "agent_audit_log."  
• Return the agent's text response to the user.

#### Request Flow (Example)

1. Frontend sends a POST request to /functions/v1/student-ai-agent with JSON { action, content, etc. }.  
2. The edge function checks the Authorization header, initializes a Supabase client.  
3. The edge function parses the user's request and decides, based on "action" or the natural language input, which tool to call:  
   - Perform a similarity search on the vector database to find the most relevant project and feature IDs.  
   - Storing a doc (embedding) in "ai_docs."  
   - Creating a new feature.  
   - Or in the future, updating a feature, retrieving doc embeddings, etc.  
4. Logs input & output in "agent_audit_log."  
5. Returns a JSON payload with success or error.

### 3.2 Tools Folder in student-ai-agent

Add supabase/functions/student-ai-agent/tools/. Each file in this folder contains a "tool" the agent can use. For example:

• storeEmbedding.ts  
   – Takes text, doc type, and metadata.  
   – Generates an embedding Array<number> (dimension 1536).  
   – Inserts into the "ai_docs" table.  

• createFeatureTool.ts  
   – Calls the existing supabase/functions/student-create-feature function to actually create a feature.  
   – Expects user parameters like project ID, feature name, description, etc.  
   – Returns a success or error message.  

• agentAuditLogger.ts  
   – Writes an event to the "agent_audit_log" table.  
   – Optionally includes chain-of-thought or step-by-step logs.

• searchForDetails.ts  
   – Performs a similarity search on the vector database to find the 10 most relevant docs
   - Uses an LLM to determine objective data like project_id, feature_id, etc that will be used to make the final db call


### 3.3 Example Code Structure

1) index.ts (entry point, minimal agent logic).  
2) tools/storeEmbedding.ts (handles "store document" scenario).  
3) tools/createFeatureTool.ts (calls the existing student-create-feature function).  
4) tools/agentAuditLogger.ts (logs user input / agent responses).
5) tools/searchForDetails.ts (similarity search in vector db)

---

## 4. LANGSMITH OBSERVABILITY

### 4.1 Integration Points

• For each request, push events to Langsmith's streaming or logging endpoints, capturing user requests and final LLM responses in real time.  
• For fallback usage, store records in "agent_audit_log." This keeps an internal record even if external logging is unavailable.

### 4.2 Implementation

• In the agent code, you might initialize a LangChain tracer with Langsmith credentials.  
• Each time the LLM is called, you record events, tokens used, or function calls.  
• For advanced usage, you can store chain-of-thought or intermediate steps.  
• Keep private details out of final logs if that's a concern.

---

## 5. FRONTEND INTEGRATION

### 5.1 Chat-Like Interface

• Create a new component, e.g., src/features/ai/components/StudentAiChat.tsx, to:  
  1) Display previous messages (user & agent).  
  2) Provide an input box for new queries.  
  3) On submit, call /functions/v1/student-ai-agent with relevant JSON.  

• Maintain conversation state in a local store (Zustand) or in the component.  

### 5.2 Creating or Linking Features

• Currently, "createFeature" calls the "student-create-feature" function.  
• The AI agent can call a "createFeatureTool" that in turn does an HTTP request to the student-create-feature edge function.  
• Over time, you can add more tools to handle other actions (e.g., "updateFeatureTool," "deleteFeatureTool," etc.).  

### 5.3 Security & Auth

• Require valid Bearer tokens (JWT).  
• Only authorized student users can call these endpoints.  

---

## 6. IMPLEMENTATION CHECKLIST

1. Database Migrations
   • "ai_docs" table (vector(1536), doc_type, content, etc.).  
   • "agent_audit_log" table.  

2. Edge Function Setup
   • Create folder: supabase/functions/student-ai-agent.  
   • Add index.ts to parse body, handle actions, and do error handling/logging.  
   • Add a tools folder with storeEmbedding.ts, createFeatureTool.ts, agentAuditLogger.ts, searchForDetails.ts, etc.  

3. Calling Other Edge Functions
   • In createFeatureTool.ts, do a fetch to /functions/v1/student-create-feature with parameters from the user.  
   • The agent decides which tool to call based on user input.  

4. Langsmith Integration
   • Add environment variables (LANGCHAIN_API_KEY, etc.)  
   • Optionally initialize a tracer in the agent code.  
   • Log agent calls to Langsmith, plus store them in agent_audit_log.  

5. Frontend
   • Create a new StudentAiChat.tsx for a chat-like interface.  
   • Provide a function in a new feature/ai/api/student-ai.api.ts that calls /functions/v1/student-ai-agent  

6. Testing
   • Test "createFeatureTool" calls with valid tokens and see if the feature is created successfully.  
   • Confirm embeddings or doc storage calls are working.  
   • Confirm logs appear in agent_audit_log.  

7. Future Extensions
   • Add "updateFeatureTool," "deleteFeatureTool," or other specialized actions.  
   • Explore advanced retrieval with vector similarity queries.  
   • Create admin-ai-agent or tester-ai-agent with specialized tools.  

---

## 7. DELIVERABLES FOR HANDOFF

• Supabase migrations or instructions to create "ai_docs" and "agent_audit_log" tables.  
• "student-ai-agent" function code: index.ts, plus a "tools" folder including createFeatureTool.ts, storeEmbedding.ts, and agentAuditLogger.ts.  
• React-based chat UI (StudentAiChat.tsx) or an updated interface in your existing code.  
• Documentation on env variables and usage instructions.  

With these steps, the software engineer should be able to implement the new AI agent flow, integrate embeddings, store logs, and provide a chat experience. As the system scales, more tools can be added to cover additional tasks. This plan leaves minimal open questions, ensuring a smooth handoff.

---
