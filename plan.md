# **Step-by-Step Plan: Multi-Agent Customer Support System**

Based on your tickets.json (telecom customer data) and the multi-agent architecture you want, here's the complete implementation plan:

---

## **📋 System Architecture Overview**

```
                    [Coordinator Agent]
                     (Orchestrator)
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    [Intent Agent]    [Reply Agent]   [Escalation Agent]
    - Classifies      - Generates      - Decides if human
      customer          response          needed
      intent          - Uses context    - Creates tickets
```

---

## **🎯 Step 1: Understand Your Data Structure**

Your tickets.json contains **telecom customer data**:

- **Customer Info**: ID, gender, senior citizen status, partner, dependents
- **Services**: Phone, Internet (DSL/Fiber), Streaming, Tech Support
- **Billing**: Monthly charges, payment method, contract type
- **Status**: Churn prediction, ticket status (new/resolved)

**Common Customer Issues:**
- Billing complaints (high charges)
- Service issues (internet not working)
- Cancellation requests (churn risk)
- Upgrades/downgrades
- Technical support

---

## **🛠️ Step 2: Define Agent Responsibilities**

### **Intent Agent** (Classifier)
**Input**: Customer message  
**Output**: Intent + Urgency level

**Intents to detect:**
- `billing_issue` → "My bill is too high"
- `service_outage` → "Internet not working"
- `cancellation` → "I want to cancel"
- `tech_support` → "Can't connect to WiFi"
- `upgrade_request` → "Want faster internet"
- `payment_issue` → "Payment failed"
- `general_inquiry` → "What plans do you have?"

**Urgency Levels:**
- `high` → Service outage, cancellation, payment failure
- `medium` → Billing disputes, tech support
- `low` → General questions, upgrades

---

### **Reply Agent** (Response Generator)
**Input**: Message + Intent + Customer data  
**Output**: Personalized response

**What it does:**
- Fetches customer info from tickets.json
- Generates contextual reply
- Suggests solutions based on customer's current services

**Example:**
```
Customer ID: 7590-VHVEG
Intent: billing_issue
Current: DSL, $29.85/month

Reply: "I see you're on a DSL plan at $29.85/month. 
Let me review your charges. Are you experiencing 
unexpected fees?"
```

---

### **Escalation Agent** (Decision Maker)
**Input**: Intent + Urgency + Customer history  
**Output**: Escalate (Yes/No) + Ticket details

**Escalation Rules:**
- **High urgency** → Always escalate
- **Churn = Yes** → Escalate (retention priority)
- **Senior Citizen = 1** → Escalate (needs special care)
- **Multiple issues in history** → Escalate

**Creates ticket with:**
- Priority level
- Assigned department (billing/tech/retention)
- Customer context
- Suggested actions

---

## **📝 Step 3: State Management Design**

```typescript
type CustomerSupportState = {
  // Current conversation
  conversationHistory: Message[];
  
  // Customer lookup
  currentCustomer: {
    id: string;
    found: boolean;
    data: TicketData | null;
  };
  
  // Agent outputs
  intent: {
    category: string;
    urgency: "low" | "medium" | "high";
    confidence: number;
  };
  
  reply: {
    message: string;
    suggestedActions: string[];
  };
  
  escalation: {
    required: boolean;
    reason: string;
    ticketId?: string;
    assignedTo?: "billing" | "tech" | "retention";
    priority: number;
  };
  
  // Memory
  previousInteractions: number;
  resolvedIssues: string[];
}
```

---

## **🔧 Step 4: Implementation Plan**

### **Phase 1: Setup (Day 1)**

**File Structure:**
```
apps/agent/src/
├── agents/
│   ├── intentAgent.ts       → Classifies intent
│   ├── replyAgent.ts        → Generates responses
│   ├── escalationAgent.ts   → Decides escalation
│   └── coordinator.ts       → Orchestrates workflow
├── tools/
│   ├── customerLookup.ts    → Searches tickets.json
│   ├── ticketCreator.ts     → Creates escalation tickets
│   └── memoryManager.ts     → Stores conversation history
├── types/
│   └── state.ts             → Type definitions
├── utils/
│   └── dataLoader.ts        → Loads tickets.json
└── index.ts                 → Exports graph
```

---

### **Phase 2: Build Tools (Day 1-2)**

**Tool 1: Customer Lookup**
```typescript
// Search tickets.json by customer ID or phone
function findCustomer(customerId: string): TicketData | null
function findByPhone(phone: string): TicketData | null
```

**Tool 2: Intent Classification**
```typescript
// Analyzes message using AI + keywords
function classifyIntent(message: string): {
  intent: string;
  urgency: string;
  keywords: string[];
}
```

**Tool 3: Reply Generation**
```typescript
// Creates personalized response
function generateReply(
  message: string,
  intent: string,
  customerData: TicketData
): string
```

**Tool 4: Escalation Logic**
```typescript
// Decides if escalation needed
function shouldEscalate(
  intent: string,
  urgency: string,
  customerData: TicketData
): EscalationDecision
```

**Tool 5: Ticket Creator**
```typescript
// Creates escalation ticket
function createTicket(
  customer: TicketData,
  issue: string,
  priority: number
): Ticket
```

---

### **Phase 3: Build Agents (Day 2-3)**

**Agent 1: Intent Agent Node**
```typescript
async function intentAgentNode(
  state: CustomerSupportState,
  config: RunnableConfig
) {
  // 1. Get last user message
  // 2. Call intent classification tool
  // 3. Update state with intent + urgency
  // 4. Return updated state
}
```

**Agent 2: Reply Agent Node**
```typescript
async function replyAgentNode(
  state: CustomerSupportState,
  config: RunnableConfig
) {
  // 1. Get customer data (if ID provided)
  // 2. Use intent + customer context
  // 3. Generate personalized reply
  // 4. Add suggested actions
  // 5. Return updated state
}
```

**Agent 3: Escalation Agent Node**
```typescript
async function escalationAgentNode(
  state: CustomerSupportState,
  config: RunnableConfig
) {
  // 1. Check escalation rules
  // 2. If escalate: create ticket
  // 3. Determine priority + assignment
  // 4. Return decision + ticket ID
}
```

---

### **Phase 4: Build Coordinator (Day 3-4)**

**LangGraph Workflow:**
```typescript
const workflow = new StateGraph(CustomerSupportStateAnnotation)
  .addNode("intent_agent", intentAgentNode)
  .addNode("reply_agent", replyAgentNode)
  .addNode("escalation_agent", escalationAgentNode)
  .addEdge(START, "intent_agent")
  .addEdge("intent_agent", "reply_agent")
  .addEdge("reply_agent", "escalation_agent")
  .addConditionalEdges("escalation_agent", shouldEnd);

export const graph = workflow.compile({ checkpointer: memory });
```

**Execution Flow:**
```
User Message
    ↓
[Intent Agent] → Classifies: "billing_issue", urgency: "high"
    ↓
[Reply Agent] → Looks up customer ID: 7590-VHVEG
              → Sees: $29.85/month, DSL
              → Generates: "I see you're concerned about billing..."
    ↓
[Escalation Agent] → Checks: High urgency + billing
                   → Creates: Ticket #1234, assigned to billing team
    ↓
Final Response to User + Ticket Created
```

---

### **Phase 5: Frontend Integration (Day 4-5)**

**Update page.tsx:**

```typescript
// Remove proverbs, add customer support state
type CustomerSupportState = {
  conversationHistory: Message[];
  currentCustomer: CustomerData | null;
  escalation: EscalationInfo | null;
};

const { state } = useCoAgent<CustomerSupportState>({
  name: "customerSupportCoordinator",
  initialState: {
    conversationHistory: [],
    currentCustomer: null,
    escalation: null
  }
});
```

**UI Components:**

1. **Customer Info Panel** → Shows current customer details
2. **Escalation Badge** → Shows if ticket created
3. **Suggested Actions** → Quick reply buttons
4. **Conversation History** → Shows past interactions

---

## **🎨 Step 6: Enhanced Features**

### **Optional Additions:**

**1. Customer Identification:**
```
User: "My internet isn't working"
Agent: "I'd be happy to help! Could you provide your customer ID or phone number?"
User: "7590-VHVEG"
Agent: [Looks up] "Thanks! I see you're a DSL customer..."
```

**2. Churn Prevention:**
```typescript
if (customer.Churn === "Yes") {
  // Flag for retention team
  // Offer special deals
  // Prioritize response
}
```

**3. Smart Routing:**
```
Billing Issue → Billing Department
Tech Issue → Technical Support
Cancellation → Retention Team
```

**4. Analytics Dashboard:**
- Most common issues
- Escalation rate
- Average resolution time
- Customer satisfaction

---

## **📊 Step 7: Testing Strategy**

**Test Cases:**

1. **Billing Complaint**: "My bill is $99 but should be $70"
2. **Service Outage**: "Internet down for 2 hours"
3. **Cancellation**: "I want to cancel my subscription"
4. **General Question**: "What internet plans do you offer?"
5. **Upgrade Request**: "Can I upgrade to fiber optic?"

**Expected Flow for Each:**
- Intent correctly classified ✓
- Customer data retrieved ✓
- Personalized reply generated ✓
- Escalation decision correct ✓

---

## **🚀 Step 8: Deployment Checklist**

- [ ] All agents implemented
- [ ] Tools tested with tickets.json
- [ ] Frontend UI updated
- [ ] Memory system working
- [ ] Escalation logic validated
- [ ] Error handling added
- [ ] Environment variables set
- [ ] Documentation written

---

## **⏱️ Timeline**

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Setup** | 4 hours | File structure + types |
| **Tools** | 1 day | All 5 tools working |
| **Agents** | 1.5 days | 3 agents implemented |
| **Coordinator** | 1 day | Graph workflow complete |
| **Frontend** | 1 day | UI integrated |
| **Testing** | 0.5 days | All test cases pass |
| **Total** | **5 days** | Production ready |

---

## **🎯 Success Metrics**

- ✅ Intent classification accuracy > 85%
- ✅ Response time < 2 seconds
- ✅ Escalation precision > 90%
- ✅ Customer satisfaction rating > 4/5

---

**Ready to start? I can help you implement any phase step-by-step!** Which part would you like to begin with?