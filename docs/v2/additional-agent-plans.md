Below is an outline/pseudo‐roadmap you can give to your software engineer. It takes into account:
How the existing frontend AI chat flow works (React + Zustand at dallas-group-user-testing/src/features/ai)
How the Python microservice is currently set up with a single “create_feature” tool (at s-black-ai-python-service/tools/create_feature.py)
How you want to expand the AI agent to handle many more actions by calling your existing Supabase Edge Functions (in dallas-group-user-testing/supabase/functions/...)
-------------------------------------------------------------------------------
OVERVIEW OF CURRENT ARCHITECTURE
-------------------------------------------------------------------------------
• Frontend React (StudentAiChat.tsx & AiChatStore):
– This collects user messages, sends them to the Python AI microservice via the backend, and renders the AI’s responses.
– The “create_feature” flow is already proof that the conversation can call a “createFeature” tool on the Python side and do meaningful actions.
• Python AI Microservice (@s-black-ai-python-service):
– Uses FastAPI (app.py) and a “main.py” that coordinates an LLM (LangChain) with optional Tools.
– Currently, only the “create_feature.py” tool is implemented.
– The chain in main.py calls process_with_langchain(...) and passes in the list of Tools. If the LLM decides to call the “create_feature” tool, it calls the relevant Supabase Edge Function or direct Supabase API to perform the action.
• Supabase Edge Functions (dallas-group-user-testing/supabase/functions/...):
– These handle the main backend logic: creating projects, retrieving details, listing testers, etc.
– Each function is already well-defined with an index.ts that sets up a route and a minimal logic file.
We want to replicate how the “create_feature” tool is currently structured for many more functionalities (look up project details, retrieve tester queues, create tickets, etc.) and then wire them into the agent so they can be called automatically in response to user queries.
-------------------------------------------------------------------------------
DEFINE THE ADDITIONAL “TOOLS” YOU NEED
-------------------------------------------------------------------------------
For each new capability, you will create a new Python tool in s-black-ai-python-service/tools. For example:
• Student-Focused Tools:
(a) “RetrieveProjectDetailsTool” – calls your “admin-projects” function or a direct “projects” endpoint to get project info.
(b) “GetValidationProgressTool” – calls your “validations” endpoints or “admin-overview” endpoints if that is where the data resides.
(c) “AddTesterToFeatureTool” – calls a function similar to create_feature but for assigning testers.
(d) “CreateNewProjectTool” – calls the admin-create-project-registry or a “projects” function.
• Admin-Focused Tools:
(a) “AdminOverviewTool” – calls “admin-overview” function for metrics.
(b) “GetAdminProjectInfoTool” – calls “admin-projects” service to see details.
(c) “GetAdminTesterInfoTool” or “AdminTesterPerformanceTool” – calls “admin-testers” function.
(d) “GetAdminTestHistoryTool” – calls “admin-testers” or “admin-tickets.”
(e) “CreateTicketTool” – calls “admin-tickets” function.
• Tester-Focused Tools:
(a) “GetTesterQueueTool” – calls “admin-tickets” or “testing_tickets” table.
(b) “GetTesterHistoryTool” – again calls “admin-testers” or “admin-tickets.”
(c) “GetTesterMetricsTool” – calls “admin-testers” for performance metrics.
You don’t have to perfectly match these names, but each tool should be very similar in structure to create_feature.py:
1) A class that inherits from BaseTool.
2) A name and description that your LangChain agent can parse.
3) A method .execute(...) that does something like:
– Possibly parse or look up the “project_id,” “user_id,” etc. from the conversation context or tool arguments.
– Makes the appropriate call to your Supabase function (like you do with create_feature’s async request).
– Returns a JSON dictionary with the “success,” any “error,” and any relevant output data to feed back to the user.
-------------------------------------------------------------------------------
HOW TO STRUCTURE EACH TOOL
-------------------------------------------------------------------------------
Let’s use an example approach (similar to create_feature.py):
1) Create s-black-ai-python-service/tools/get_project_info.py:
from typing import Dict, Any, Optional, List
import aiohttp
from .base import BaseTool, ContextSearchResult
class GetProjectInfoTool(BaseTool):
name = "get_project_info"
description = "Fetch details about a project by project_id."
def init(self, context_results: List[ContextSearchResult], auth_token: str):
super().init(context_results)
self.auth_token = auth_token
async def execute(self, project_id: str) -> Dict[str, Any]:
if not project_id:
# Possibly infer from context or return an error
return {
"success": False,
"error": "No project_id provided."
}
# Example: calling the “admin-projects” function or direct REST endpoint
url = "https://<YOUR_SUPABASE_EDGE_FUNCTION>/admin-projects?project_id=" + project_id
headers = {
"apikey": self.auth_token,
"Content-Type": "application/json"
}
try:
async with aiohttp.ClientSession() as session:
async with session.get(url, headers=headers) as resp:
data = await resp.json()
if resp.status != 200:
return {"success": False, "error": data.get("error", "Failed to get project info")}
return {
"success": True,
"project_details": data
}
except Exception as e:
return {"success": False, "error": str(e)}
2) Add that tool to your tools list in main.py or wherever you handle “tools = [CreateFeatureTool, ...]” so the agent can discover it.
-------------------------------------------------------------------------------
LET LANGCHAIN/MODEL DECIDE WHICH TOOL TO CALL
-------------------------------------------------------------------------------
Inside s-black-ai-python-service/main.py, you likely have something like this snippet (simplified) that sets up tools:
async def generate_ai_response(
prompt: str,
base_prompt: str,
user_id: str,
authToken: str,
project_id: Optional[str] = None,
...
) -> Dict[str, Any]:
# (1) Gather Tools
from tools.create_feature import CreateFeatureTool
from tools.get_project_info import GetProjectInfoTool
...
all_tools = [
CreateFeatureTool(context_results, authToken),
GetProjectInfoTool(context_results, authToken),
...
]
# (2) pass all_tools into process_with_langchain
result = await process_with_langchain(
query=prompt,
context=some_context,
tools=all_tools
)
...
return result
Then in process_with_langchain, the chain tries to do something like a ReAct or MRKL approach to pick the correct tool.
-------------------------------------------------------------------------------
HOW THE AGENT FIGURES OUT THE TOOL’S ARGUMENTS
-------------------------------------------------------------------------------
• Typically, you define “description: str” for each tool that spells out the arguments the agent should pass.
• Because you’re using a fairly free‐form approach, you can rely on the LLM’s chain-of-thought to parse arguments out of the user’s command. If you want to be more consistent or robust, consider children like "Tool = StructuredTool" or pydantic-based argument schemas that make the agent parse arguments more carefully.
• The same approach you used for create_feature can be extended to all these tools.
-------------------------------------------------------------------------------
CONNECTING THE RESULTS BACK TO THE FRONTEND
-------------------------------------------------------------------------------
Once the tool returns a JSON (like “success: True, project_details: {...}”), your chain or final LLM output can incorporate that info into a user-facing message. This is how your StudentAiChat sees the final answer that includes the newly retrieved data.
In React:
• messages are stored in useAiChatStore. The AI’s final response is appended to the conversation.
• If you want to display structured data in a nice component, add or refine the logic in ToolResponseRouter.tsx to handle different “toolName” or “toolResult” shape.
• For example, if the AI calls get_project_info and returns { "success": true, "tool_result": { "project_details": {...} } }, then have a “ProjectInfoCard” that shows the data.
-------------------------------------------------------------------------------
LEVERAGING EXISTING SUPABASE EDGE FUNCTIONS
-------------------------------------------------------------------------------
Since you already have a bunch of specialized Edge Functions (admin-overview, admin-projects, admin-testers, etc.):
A. Identify each function’s input requirements (e.g. “project_id” in the querystring or body).
B. Decide how to call it from the Python side (GET vs POST, query parameters vs JSON body, etc.).
C. Write a tool that wraps that function call. The tool’s name & description becomes an LLM hint for “how to call it.”
-------------------------------------------------------------------------------
CONVERSATION CONTEXT & HISTORY
-------------------------------------------------------------------------------
• If you want the agent to recall details about a user (role = admin, tester, or student) or about a specific project across turns, you can store that in the conversation. Some ways to do it:
– The “metadata” argument in your store’s sendMessage(...) can persist user role or last known project_id.
– The Python side can use that info to guide the LLM about which tools are relevant.
• Possibly have a “UserProfileTool” or a mechanism to keep track of role-based constraints.
-------------------------------------------------------------------------------
STEP-BY-STEP IMPLEMENTATION PLAN
-------------------------------------------------------------------------------
Below is a suggested stepwise plan for your team:
1) Setup:
– Confirm that the agent is currently working with CreateFeatureTool end to end.
– In main.py, confirm that the list of tools is passed to process_with_langchain.
2) Choose Tools to Add:
– Make a short list of 3–5 immediate priority tools (like “GetProjectInfoTool,” “AdminOverviewTool,” etc.).
– For each, identify which Edge Function or REST endpoint needs to be called. Gather required arguments.
3) Implement Each Tool:
– Follow the create_feature.py pattern: define name, description, .execute(...) to do the call.
– Spot check that you can fetch actual data from your Edge Function.
4) Integrate Tools with the Agent:
– Import them in main.py (or wherever you define the toolset).
– Add them to the array that’s passed to process_with_langchain.
5) Adjust LLM Behavior:
– If you’re using a standard ReAct chain or ConversationChain with Tools, ensure that the agent has enough context in the prompt to see your new tool descriptions.
– Possibly refine the “base_prompt” or “system prompt” to let the agent know about these new tool names.
6) Testing:
– Try relevant user queries from the frontend chat, e.g. “Show me the details of project ABC” or “Add user X as a tester for feature Y.”
– Evaluate the chain-of-thought logs to see if the agent picks the correct tool. Adjust descriptions if the LLM is making mistakes.
7) Frontend Custom Render:
– In dallas-group-user-testing/src/features/ai/components/ToolResponseCards/ToolResponseRouter.tsx, add logic for your new tool results. If you want “GetProjectInfoTool” to show a fancy card, add a small component that displays the project details in a structured format.
8) Role-based Handling (optional advanced step):
– If you want to automatically detect if the user is a Student or an Admin, incorporate that into the conversation. Possibly load the user’s role from your React store, pass it along in the “metadata,” and then shape the LLM system prompt to mention “The user is an Admin, so these Tools are relevant to them.”
9) Expand & Iterate:
– Once you confirm the first wave of Tools works, you can keep adding more specialized Tools that map onto your Edge Functions.
– Each time, test your new actions from the AI Chat.
-------------------------------------------------------------------------------
SUMMARY
-------------------------------------------------------------------------------
• You already have a working “create_feature” tool pipeline from React → [ai-chat.store + StudentAiChat] → Python → “create_feature.py” → Supabase Edge Function.
• Extend that same approach to cover all other actions (admin, testers, advanced queries).
• Each action is basically a “Tool” class that takes user arguments, calls your existing function, and returns the result.
• The agent’s system prompt (or the chain logic in main.py) must be updated so the LLM knows these new Tools exist and how to call them.
• On the frontend, treat the responses the same way as you do now—possibly building a custom <ToolCard> or <ResponseCard> component for each type of response data.
Following these steps, you’ll achieve a multi-tool AI assistant that can handle a broad set of tasks across student, admin, and tester roles by calling your existing Supabase backend functions.