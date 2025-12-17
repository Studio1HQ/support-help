// /**
//  * This is the main entry point for the agent.
//  * It defines the workflow graph, state, tools, nodes and edges.
//  */

// import { z } from "zod";
// import { RunnableConfig } from "@langchain/core/runnables";
// import { tool } from "@langchain/core/tools";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
// import { AIMessage, SystemMessage } from "@langchain/core/messages";
// import { MemorySaver, START, StateGraph } from "@langchain/langgraph";
// import { ChatOpenAI } from "@langchain/openai";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import {
//   convertActionsToDynamicStructuredTools,
//   CopilotKitStateAnnotation,
// } from "@copilotkit/sdk-js/langgraph";
// import { Annotation } from "@langchain/langgraph";

// // 1. Define our agent state, which includes CopilotKit state to
// //    provide actions to the state.
// const AgentStateAnnotation = Annotation.Root({
//   ...CopilotKitStateAnnotation.spec, // CopilotKit state annotation already includes messages, as well as frontend tools
//   proverbs: Annotation<string[]>,
// });

// // 2. Define the type for our agent state
// export type AgentState = typeof AgentStateAnnotation.State;

// // 3. Define a simple tool to get the weather statically
// const getWeather = tool(
//   (args) => {
//     return `The weather for ${args.location} is 70 degrees, clear skies, 45% humidity, 5 mph wind, and feels like 72 degrees.`;
//   },
//   {
//     name: "getWeather",
//     description: "Get the weather for a given location.",
//     schema: z.object({
//       location: z.string().describe("The location to get weather for"),
//     }),
//   },
// );

// // 4. Put our tools into an array
// const tools = [getWeather];

// // 5. Define the chat node, which will handle the chat logic
// async function chat_node(state: AgentState, config: RunnableConfig) {
//   // 5.1 Define the model, lower temperature for deterministic responses
//   // const model = new ChatOpenAI({ temperature: 0, model: "gpt-4o" });
//   const model = new ChatGoogleGenerativeAI({ temperature: 0, model: "gemini-2.5-flash-lite" });

//   // 5.2 Bind the tools to the model, include CopilotKit actions. This allows
//   //     the model to call tools that are defined in CopilotKit by the frontend.
//   const modelWithTools = model.bindTools!([
//     ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
//     ...tools,
//   ]);

//   // 5.3 Define the system message, which will be used to guide the model, in this case
//   //     we also add in the language to use from the state.
//   const systemMessage = new SystemMessage({
//     content: `You are a helpful assistant. The current proverbs are ${JSON.stringify(state.proverbs)}.`,
//   });

//   // 5.4 Invoke the model with the system message and the messages in the state
//   const response = await modelWithTools.invoke(
//     [systemMessage, ...state.messages],
//     config,
//   );

//   // 5.5 Return the response, which will be added to the state
//   return {
//     messages: response,
//   };
// }

// // 6. Define the function that determines whether to continue or not,
// //    this is used to determine the next node to run
// function shouldContinue({ messages, copilotkit }: AgentState) {
//   // 6.1 Get the last message from the state
//   const lastMessage = messages[messages.length - 1] as AIMessage;

//   // 7.2 If the LLM makes a tool call, then we route to the "tools" node
//   if (lastMessage.tool_calls?.length) {
//     // Actions are the frontend tools coming from CopilotKit
//     const actions = copilotkit?.actions;
//     const toolCallName = lastMessage.tool_calls![0].name;

//     // 7.3 Only route to the tool node if the tool call is not a CopilotKit action
//     if (!actions || actions.every((action) => action.name !== toolCallName)) {
//       return "tool_node";
//     }
//   }

//   // 6.4 Otherwise, we stop (reply to the user) using the special "__end__" node
//   return "__end__";
// }

// // Define the workflow graph
// const workflow = new StateGraph(AgentStateAnnotation)
//   .addNode("chat_node", chat_node)
//   .addNode("tool_node", new ToolNode(tools))
//   .addEdge(START, "chat_node")
//   .addEdge("tool_node", "chat_node")
//   .addConditionalEdges("chat_node", shouldContinue as any);

// const memory = new MemorySaver();

// export const graph = workflow.compile({
//   checkpointer: memory,
// });
// ============================
/**
 * Multi-Agent Customer Support System
 * Coordinator that orchestrates Intent, Lookup, Reply, and Escalation agents
 */

// import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
// import { CustomerSupportStateAnnotation, CustomerSupportState } from "./types/state";
// import {
//   intentAgentNode,
//   customerLookupAgentNode,
//   replyAgentNode,
//   escalationAgentNode,
// } from "./agents";

// // Memory for conversation persistence
// const memory = new MemorySaver();

// /**
//  * Routing logic: Decide next step after each agent
//  */
// function shouldContinueAfterIntent(state: CustomerSupportState): string {
//   // After intent classification, always try to lookup customer
//   return "customer_lookup";
// }

// function shouldContinueAfterLookup(state: CustomerSupportState): string {
//   // After customer lookup, generate reply
//   return "reply_agent";
// }

// function shouldContinueAfterReply(state: CustomerSupportState): string {
//   // After reply, check if escalation needed
//   return "escalation_agent";
// }

// function shouldEnd(state: CustomerSupportState): string {
//   // After escalation check, end the workflow
//   return END;
// }

// /**
//  * Build the multi-agent workflow graph
//  */
// const workflow = new StateGraph(CustomerSupportStateAnnotation)
//   // Add all agent nodes
//   .addNode("intent_agent", intentAgentNode)
//   .addNode("customer_lookup", customerLookupAgentNode)
//   .addNode("reply_agent", replyAgentNode)
//   .addNode("escalation_agent", escalationAgentNode)
  
//   // Define the flow
//   .addEdge(START, "intent_agent")
//   .addConditionalEdges("intent_agent", shouldContinueAfterIntent)
//   .addConditionalEdges("customer_lookup", shouldContinueAfterLookup)
//   .addConditionalEdges("reply_agent", shouldContinueAfterReply)
//   .addConditionalEdges("escalation_agent", shouldEnd);

// /**
//  * Compile the workflow with memory
//  */
// export const graph = workflow.compile({
//   checkpointer: memory,
// });

// /**
//  * Workflow execution order:
//  * 
//  * User Message
//  *      ↓
//  * [Intent Agent] → Classifies intent & urgency
//  *      ↓
//  * [Customer Lookup] → Finds customer by ID
//  *      ↓
//  * [Reply Agent] → Generates personalized response
//  *      ↓
//  * [Escalation Agent] → Decides if human needed
//  *      ↓
//  * END → Returns final response to user
//  */ 


/**
 * Multi-Agent Customer Support System
 * Properly integrated with CopilotKit
 */

import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";
import { findCustomerById } from "./utils/dataLoader";

// Import our custom tools
import {
  customerLookupTool,
  intentClassifierTool,
  escalationDecisionTool,
  replyGeneratorTool,
} from "./tools";
import { CustomerData } from "./types/state";

// ==========================================
// 1. DEFINE STATE WITH COPILOTKIT
// ==========================================
const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  
  // Custom state for customer support
  currentCustomer: Annotation<{
    id: string;
    found: boolean;
    data: CustomerData | null;
  }>({
    reducer: (_, value) => value,
    default: () => ({ id: "", found: false, data: null }),
  }),
  
  intent: Annotation<{
    category: string;
    urgency: string;
    confidence: number;
    keywords: string[];
  } | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),
  
  reply: Annotation<{
    message: string;
    suggestedActions: string[];
  } | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),
  
  escalation: Annotation<{
    required: boolean;
    reason: string;
    ticketId?: string;
    assignedTo?: string;
    priority: number;
  } | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;

// ==========================================
// 2. DEFINE TOOLS ARRAY
// ==========================================
const tools = [
  customerLookupTool,
  intentClassifierTool,
  escalationDecisionTool,
  replyGeneratorTool,
];

// ==========================================
// 3. MAIN CHAT NODE WITH AI MODEL
// ==========================================
async function chat_node(state: AgentState, config: RunnableConfig) {
  console.log("\n🤖 === CHAT NODE STARTED ===");
  
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];
  
  if (!lastMessage) {
    return {};
  }
  
  const userMessage = typeof lastMessage.content === 'string' 
    ? lastMessage.content 
    : JSON.stringify(lastMessage.content);
  
  console.log("📝 User Message:", userMessage);
  
  // Initialize the AI model
  const model = new ChatGoogleGenerativeAI({ 
    temperature: 0.3, 
    model: "gemini-2.5-flash-lite" 
  });
  
  // Bind all tools (including frontend actions from CopilotKit)
  const modelWithTools = model.bindTools([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);
  
  // Create system message with customer support context
  const systemMessage = new SystemMessage({
    content: `You are an AI customer support assistant for a telecom company.

Your workflow:
1. First, classify the customer's intent using the "classifyIntent" tool
2. If a customer ID is mentioned, look them up using "lookupCustomer" tool
3. Generate a helpful reply using "generateReply" tool with the context
4. Check if escalation is needed using "checkEscalation" tool

Current customer: ${state.currentCustomer?.found ? `ID ${state.currentCustomer.id}` : "Not identified"}
Current intent: ${state.intent?.category || "Not classified"}

Be helpful, professional, and always try to use the tools to provide accurate information.`,
  });
  
  // Invoke the model
  const response = await modelWithTools.invoke(
    [systemMessage, ...state.messages],
    config,
  );
  
  console.log("✅ AI Response generated");
  
  return {
    messages: response,
  };
}

// ==========================================
// 4. TOOL NODE FOR EXECUTING TOOLS
// ==========================================
const tool_node = new ToolNode(tools);

// ==========================================
// 5. ROUTING LOGIC
// ==========================================
function shouldContinue({ messages, copilotkit }: AgentState) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  
  // If AI wants to call a tool
  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const toolCallName = lastMessage.tool_calls[0].name;
    
    console.log(`🔧 Tool call detected: ${toolCallName}`);
    
    // Only route to tool node if it's NOT a frontend action
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return "tool_node";
    }
  }
  
  return "__end__";
}

// ==========================================
// 6. TOOL RESULT PROCESSOR
// ==========================================
async function process_tool_results(state: AgentState, config: RunnableConfig) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];
  
  // Check if it's a tool result message
  if (lastMessage._getType() === "tool") {
    const toolMessage = lastMessage as any;
    const toolName = toolMessage.name;
    const toolContent = toolMessage.content;
    
    console.log(`📊 Processing tool result from: ${toolName}`);
    
    try {
      // Update state based on which tool was called
      if (toolName === "classifyIntent") {
        const intent = JSON.parse(toolContent);
        console.log(`✅ Intent classified: ${intent.category} (${intent.urgency})`);
        return { intent };
      }
      
      if (toolName === "lookupCustomer") {
        if (!toolContent.includes("not found")) {
          // Extract customer ID from the tool result
          const idMatch = toolContent.match(/Customer ID: (\d{4}-[A-Z]{5})/);
          if (idMatch) {
            const customerId = idMatch[1];
            // const { findCustomerById } = await import("./utils/dataLoader");
            const customerData = findCustomerById(customerId);
            
            if (customerData) {
              console.log(`✅ Customer found: ${customerId}`);
              return {
                currentCustomer: {
                  id: customerId,
                  found: true,
                  data: customerData,
                },
              };
            }
          }
        }
      }
      
      if (toolName === "generateReply") {
        const reply = JSON.parse(toolContent);
        console.log("✅ Reply generated");
        return { reply };
      }
      
      if (toolName === "checkEscalation") {
        const escalation = JSON.parse(toolContent);
        if (escalation.required) {
          console.log(`⚠️ Escalation required: ${escalation.ticketId}`);
        }
        return { escalation };
      }
    } catch (error) {
      console.error(`❌ Error processing ${toolName} result:`, error);
    }
  }
  
  return {};
}

// ==========================================
// 7. BUILD THE WORKFLOW GRAPH
// ==========================================
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chat_node)
  .addNode("tool_node", tool_node)
  .addNode("process_results", process_tool_results)
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "process_results")
  .addEdge("process_results", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as any);

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});

/**
 * Workflow:
 * 
 * User Message
 *      ↓
 * [Chat Node] → AI decides which tool to call
 *      ↓
 * [Tool Node] → Executes the tool (intent, lookup, reply, escalation)
 *      ↓
 * [Process Results] → Updates state with tool results
 *      ↓
 * [Chat Node] → AI generates final response
 *      ↓
 * END → Returns to user
 */