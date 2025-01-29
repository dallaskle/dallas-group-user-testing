import {
  ChatOpenAI,
  OpenAIEmbeddings,
  initializeAgentExecutorWithOptions,
  SystemMessage,
  HumanMessage,
} from '../_shared/deps.ts'
import { AgentContext, SimilaritySearchResult } from '../_shared/ai-types.ts'
import { CreateFeatureTool } from './tools/createFeatureTool.ts'
import { searchForDetailsTool } from './tools/searchForDetails.ts'
import { agentAuditLoggerTool } from './tools/agentAuditLogger.ts'

interface ProjectInfo {
  id: string
  name: string
  description: string
}

interface SearchResponse {
  success: boolean
  results: SimilaritySearchResult[]
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export async function createAgent(context: AgentContext) {
  // Enable LangSmith tracing
  const LANGCHAIN_TRACING_V2 = Deno.env.get('LANGCHAIN_TRACING_V2') === 'true'
  const LANGCHAIN_API_KEY = Deno.env.get('LANGCHAIN_API_KEY')
  const LANGCHAIN_PROJECT = Deno.env.get('LANGCHAIN_PROJECT') || 'default'

  if (LANGCHAIN_TRACING_V2 && LANGCHAIN_API_KEY) {
    console.log(`LangSmith tracing enabled for project: ${LANGCHAIN_PROJECT}`)
  }

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: 'gpt-4o',
    openAIApiKey: Deno.env.get('OPENAI_API_KEY'),
  })

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: Deno.env.get('OPENAI_API_KEY'),
  })

  // Initialize tools
  const tools = [
    new CreateFeatureTool(context),
  ]

  // Create the agent
  const agent = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "chat-conversational-react-description",
    verbose: true,
    maxIterations: 3,
  })

  return {
    async processRequest(content: string) {
      try {
        // First, use embeddings to search for relevant project info
        const searchResponse = await searchForDetailsTool.execute(context, {
          query: content,
          doc_type: 'project',
        }) as SearchResponse

        // Extract project information from search results
        const projectInfo = searchResponse.results.length > 0 
          ? extractProjectInfo(searchResponse.results[0].content) 
          : null

        // Create system message with context
        const systemMessage = new SystemMessage(
          `You are an AI assistant helping students manage their projects. ${
            projectInfo
              ? `The request appears to be about the project "${projectInfo.name}"`
              : 'Try to identify which project the user is referring to.'
          }`
        )

        // Create human message with the request
        const humanMessage = new HumanMessage(content)

        // Get initial response from the model to understand the request
        const response = await model.call([systemMessage, humanMessage])

        // Log the interaction
        await agentAuditLoggerTool.execute(context, {
          agent_name: 'student-ai-agent',
          user_input: content,
          agent_response: response.content,
          additional_metadata: {
            project_info: projectInfo,
          },
        })

        // Execute the agent with the context
        const result = await agent.call({
          input: JSON.stringify({
            request: content,
            project_info: projectInfo,
            initial_analysis: response.content,
          }),
        })

        return {
          success: true,
          message: result.output,
          data: result,
        }
      } catch (error) {
        console.error('Error in agent:', error)
        return {
          success: false,
          message: 'Failed to process request',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  }
}

function extractProjectInfo(content: string): ProjectInfo | null {
  try {
    return JSON.parse(content) as ProjectInfo
  } catch {
    return null
  }
} 
