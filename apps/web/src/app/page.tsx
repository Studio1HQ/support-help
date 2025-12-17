// "use client";

// import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
// import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
// import { useState } from "react";

// export default function CopilotKitPage() {
//   const [themeColor, setThemeColor] = useState("#6366f1");

//   // 🪁 Frontend Actions: https://docs.copilotkit.ai/guides/frontend-actions
//   useCopilotAction({
//     name: "setThemeColor",
//     description: "Set the theme color of the page.",
//     parameters: [{
//       name: "themeColor",
//       description: "The theme color to set. Make sure to pick nice colors.",
//       required: true,
//     }],
//     handler({ themeColor }) {
//       setThemeColor(themeColor);
//     },
//   });

//   return (
//     <main style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}>
//       <YourMainContent themeColor={themeColor} />
//       <CopilotSidebar
//         clickOutsideToClose={false}
//         defaultOpen={true}
//         labels={{
//           title: "Popup Assistant",
//           initial: "👋 Hi, there! You're chatting with an agent. This agent comes with a few tools to get you started.\n\nFor example you can try:\n- **Frontend Tools**: \"Set the theme to orange\"\n- **Shared State**: \"Write a proverb about AI\"\n- **Generative UI**: \"Get the weather in SF\"\n\nAs you interact with the agent, you'll see the UI update in real-time to reflect the agent's **state**, **tool calls**, and **progress**."
//         }}
//       />
//     </main>
//   );
// }

// // State of the agent, make sure this aligns with your agent's state.
// type AgentState = {
//   proverbs: string[];
// }

// function YourMainContent({ themeColor }: { themeColor: string }) {
//   // 🪁 Shared State: https://docs.copilotkit.ai/coagents/shared-state
//   const {state, setState} = useCoAgent<AgentState>({
//     name: "starterAgent",
//     initialState: {
//       proverbs: [
//         "CopilotKit may be new, but its the best thing since sliced bread.",
//       ],
//     },
//   })

//   // 🪁 Frontend Actions: https://docs.copilotkit.ai/coagents/frontend-actions
//   useCopilotAction({
//     name: "addProverb",
//     description: "Add a proverb to the list.",
//     parameters: [{
//       name: "proverb",
//       description: "The proverb to add. Make it witty, short and concise.",
//       required: true,
//     }],
//     handler: ({ proverb }) => {
//       setState((prevState) => ({
//         ...prevState,
//         proverbs: [...(prevState?.proverbs || []), proverb],
//       }));
//     },
//   }, [setState]);

//   //🪁 Generative UI: https://docs.copilotkit.ai/coagents/generative-ui
//   useCopilotAction({
//     name: "getWeather",
//     description: "Get the weather for a given location.",
//     available: "disabled",
//     parameters: [
//       { name: "location", type: "string", required: true },
//     ],
//     render: ({ args }) => {
//       return <WeatherCard location={args.location} themeColor={themeColor} />
//     },
//   });

//   return (
//     <div
//       style={{ backgroundColor: themeColor }}
//       className="h-screen w-screen flex justify-center items-center flex-col transition-colors duration-300"
//     >
//       <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full">
//         <h1 className="text-4xl font-bold text-white mb-2 text-center">Proverbs</h1>
//         <p className="text-gray-200 text-center italic mb-6">This is a demonstrative page, but it could be anything you want! 🪁</p>
//         <hr className="border-white/20 my-6" />
//         <div className="flex flex-col gap-3">
//           {state.proverbs?.map((proverb, index) => (
//             <div
//               key={index}
//               className="bg-white/15 p-4 rounded-xl text-white relative group hover:bg-white/20 transition-all"
//             >
//               <p className="pr-8">{proverb}</p>
//               <button
//                 onClick={() => setState({
//                   ...state,
//                   proverbs: state.proverbs?.filter((_, i) => i !== index),
//                 })}
//                 className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity
//                   bg-red-500 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//         </div>
//         {state.proverbs?.length === 0 && <p className="text-center text-white/80 italic my-8">
//           No proverbs yet. Ask the assistant to add some!
//         </p>}
//       </div>
//     </div>
//   );
// }

// // Simple sun icon for the weather card
// function SunIcon() {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-yellow-200">
//       <circle cx="12" cy="12" r="5" />
//       <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" stroke="currentColor" />
//     </svg>
//   );
// }

// // Weather card component where the location and themeColor are based on what the agent
// // sets via tool calls.
// function WeatherCard({ location, themeColor }: { location?: string, themeColor: string }) {
//   return (
//     <div
//     style={{ backgroundColor: themeColor }}
//     className="rounded-xl shadow-xl mt-6 mb-4 max-w-md w-full"
//   >
//     <div className="bg-white/20 p-4 w-full">
//       <div className="flex items-center justify-between">
//         <div>
//           <h3 className="text-xl font-bold text-white capitalize">{location}</h3>
//           <p className="text-white">Current Weather</p>
//         </div>
//         <SunIcon />
//       </div>

//       <div className="mt-4 flex items-end justify-between">
//         <div className="text-3xl font-bold text-white">70°</div>
//         <div className="text-sm text-white">Clear skies</div>
//       </div>

//       <div className="mt-4 pt-4 border-t border-white">
//         <div className="grid grid-cols-3 gap-2 text-center">
//           <div>
//             <p className="text-white text-xs">Humidity</p>
//             <p className="text-white font-medium">45%</p>
//           </div>
//           <div>
//             <p className="text-white text-xs">Wind</p>
//             <p className="text-white font-medium">5 mph</p>
//           </div>
//           <div>
//             <p className="text-white text-xs">Feels Like</p>
//             <p className="text-white font-medium">72°</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
//   );
// }
// =======================================

"use client";

import { useState } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, useCoAgent } from "@copilotkit/react-core";

// State type for our customer support agent
type CustomerSupportState = {
  currentCustomer: {
    id: string;
    found: boolean;
    data: any;
  } | null;
  intent: {
    category: string;
    urgency: string;
    confidence: number;
  } | null;
  reply: {
    message: string;
    suggestedActions: string[];
  } | null;
  escalation: {
    required: boolean;
    reason: string;
    ticketId?: string;
    assignedTo?: string;
    priority: number;
  } | null;
};

export default function CustomerSupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <CustomerSupportInterface />
    </div>
  );
}

function CustomerSupportInterface() {
  // Connect to the multi-agent system
  const { state } = useCoAgent<CustomerSupportState>({
    name: "starterAgent",
    initialState: {
      currentCustomer: null,
      intent: null,
      reply: null,
      escalation: null,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🎯 Customer Support Assistant
        </h1>
        <p className="text-gray-600">
          Multi-Agent AI System for Telecom Customer Support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chat Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                💬 Chat with Support
              </h2>
            </div>
            <div className="h-[600px]">
              <CopilotChat
                className="h-full"
                labels={{
                  title: "How can we help you today?",
                  initial: "Hello! I'm your AI support assistant. You can ask me about:\n\n• Billing issues\n• Service problems\n• Account upgrades\n• Technical support\n\nPlease provide your Customer ID for personalized help!",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Status Dashboard */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <CustomerInfoCard customer={state.currentCustomer} />

          {/* Intent Card */}
          <IntentCard intent={state.intent} />

          {/* Escalation Card */}
          <EscalationCard escalation={state.escalation} />

          {/* Suggested Actions Card */}
          {state.reply?.suggestedActions && (
            <SuggestedActionsCard actions={state.reply.suggestedActions} />
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-12">
        <HowItWorks />
      </div>
    </div>
  );
}

// Customer Info Card Component
function CustomerInfoCard({ customer }: { customer: any }) {
  if (!customer?.found) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-300">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
          <span className="mr-2">👤</span> Customer Info
        </h3>
        <p className="text-gray-500 text-sm">
          No customer identified yet. Please provide your Customer ID.
        </p>
      </div>
    );
  }

  const data = customer.data;
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">👤</span> Customer Profile
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Customer ID:</span>
          <span className="font-semibold text-gray-800">{data.customerID}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Service:</span>
          <span className="font-semibold text-gray-800">{data.InternetService}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Charges:</span>
          <span className="font-semibold text-gray-800">${data.MonthlyCharges}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Contract:</span>
          <span className="font-semibold text-gray-800">{data.Contract}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tenure:</span>
          <span className="font-semibold text-gray-800">{data.tenure} months</span>
        </div>
        {data.Churn === "Yes" && (
          <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
            <span className="text-red-700 text-xs font-semibold">⚠️ CHURN RISK</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Intent Card Component
function IntentCard({ intent }: { intent: any }) {
  if (!intent) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-300">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
          <span className="mr-2">🎯</span> Intent Analysis
        </h3>
        <p className="text-gray-500 text-sm">Waiting for message...</p>
      </div>
    );
  }

  const urgencyColors = {
    low: "border-green-500 bg-green-50",
    medium: "border-yellow-500 bg-yellow-50",
    high: "border-red-500 bg-red-50",
  };

  const urgencyEmojis = {
    low: "🟢",
    medium: "🟡",
    high: "🔴",
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${urgencyColors[intent.urgency as keyof typeof urgencyColors]}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">🎯</span> Intent Analysis
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Category:</span>
          <span className="font-semibold text-gray-800">
            {intent.category.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Urgency:</span>
          <span className="font-semibold text-gray-800">
            {urgencyEmojis[intent.urgency as keyof typeof urgencyEmojis]} {intent.urgency.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Confidence:</span>
          <span className="font-semibold text-gray-800">
            {(intent.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Escalation Card Component
function EscalationCard({ escalation }: { escalation: any }) {
  if (!escalation) {
    return null;
  }

  if (!escalation.required) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
          <span className="mr-2">✅</span> Status
        </h3>
        <p className="text-green-600 text-sm font-semibold">
          AI can handle this request
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">🚨</span> Escalated
      </h3>
      <div className="space-y-2 text-sm">
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-red-700 font-semibold mb-1">Ticket Created</p>
          <p className="text-red-600 text-xs">{escalation.ticketId}</p>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Assigned To:</span>
          <span className="font-semibold text-gray-800 capitalize">
            {escalation.assignedTo} Team
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Priority:</span>
          <span className="font-semibold text-gray-800">
            {escalation.priority === 1 ? "🔴 High" : escalation.priority === 2 ? "🟡 Medium" : "🟢 Low"}
          </span>
        </div>
        <p className="text-gray-600 text-xs mt-2 italic">{escalation.reason}</p>
      </div>
    </div>
  );
}

// Suggested Actions Card Component
function SuggestedActionsCard({ actions }: { actions: string[] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">💡</span> Suggested Actions
      </h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 font-medium transition-colors"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

// How It Works Section
function HowItWorks() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🤖 How the Multi-Agent System Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AgentStep
          number="1"
          icon="🎯"
          title="Intent Agent"
          description="Classifies your message and determines urgency level"
        />
        <AgentStep
          number="2"
          icon="👤"
          title="Customer Lookup"
          description="Finds your account information from the database"
        />
        <AgentStep
          number="3"
          icon="💬"
          title="Reply Agent"
          description="Generates personalized response based on your context"
        />
        <AgentStep
          number="4"
          icon="🚨"
          title="Escalation Agent"
          description="Decides if human agent is needed and creates tickets"
        />
      </div>
    </div>
  );
}

function AgentStep({ number, icon, title, description }: any) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold mb-3">
        {number}
      </div>
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}