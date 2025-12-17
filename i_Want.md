This notebook implements a simple Multi-Agent Customer Support Assistant designed for enterprise workflows. It uses three lightweight agents—an Intent Agent, a Reply Agent, and an Escalation Agent—coordinated by a central Orchestrator. Together, they classify the user’s message, generate a professional reply, and decide whether escalation is required. The system demonstrates clean multi-agent orchestration suitable for enterprise automation tasks such as ticket handling, customer assistance, and workflow optimization.

Imports & Setup
import json
from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Dict
Memory System
@dataclass
class Memory:
    messages: List[Dict] = field(default_factory=list)
    max_history: int = 20

    def add(self, role, content):
        self.messages.append({
            "role": role,
            "content": content,
            "time": datetime.now().isoformat()
        })
        if len(self.messages) > self.max_history:
            self.messages = self.messages[-self.max_history:]

    def get_context(self):
        out = ""
        for m in self.messages[-5:]:
            out += f"{m['role']}: {m['content']}\n"
        return out
Intent Classifier Agent
class IntentAgent:
    def classify(self, message):
        text = message.lower()
        if "refund" in text:
            return "refund", "high"
        if "cancel" in text:
            return "cancellation", "high"
        if "invoice" in text or "bill" in text:
            return "billing", "medium"
        if "help" in text:
            return "general_help", "low"
        return "general", "low"
Reply Generator Agent
class ReplyAgent:
    def create_reply(self, message, intent, urgency):
        if intent == "refund":
            return "I understand you want a refund. Please share your order ID so I can assist you further."
        if intent == "cancellation":
            return "I can help you cancel your subscription. Kindly provide your registered email."
        if intent == "billing":
            return "It seems you have a billing concern. Please send your invoice number for verification."
        if intent == "general_help":
            return "Sure, I'm here to help. Could you please share more details?"
        return "Thank you for your message. How can I assist you today?"
Escalation Agent
class EscalationAgent:
    def check(self, intent, urgency, message):
        if urgency == "high":
            return {
                "escalate": True,
                "note": f"Urgent {intent} issue. Needs human review."
            }
        return {
            "escalate": False,
            "note": "No escalation required."
        }
Coordinator Agent
class Coordinator:
    def __init__(self):
        self.intent_agent = IntentAgent()
        self.reply_agent = ReplyAgent()
        self.escalation_agent = EscalationAgent()
        self.memory = Memory()

    def ask(self, message):
        self.memory.add("user", message)

        intent, urgency = self.intent_agent.classify(message)

        reply = self.reply_agent.create_reply(message, intent, urgency)

        escalation = self.escalation_agent.check(intent, urgency, message)

        final_output = {
            "intent": intent,
            "urgency": urgency,
            "reply": reply,
            "escalation": escalation
        }

        self.memory.add("agent", reply)

        return final_output
Test the Multi-Agent System
agent = Coordinator()

messages = [
    "I want to cancel my subscription.",
    "My invoice amount is wrong.",
    "I need a refund please.",
    "Hello, I need help."
]

for msg in messages:
    print("USER:", msg)
    out = agent.ask(msg)
    print(json.dumps(out, indent=2))
    print("-" * 50)
USER: I want to cancel my subscription.
{
  "intent": "cancellation",
  "urgency": "high",
  "reply": "I can help you cancel your subscription. Kindly provide your registered email.",
  "escalation": {
    "escalate": true,
    "note": "Urgent cancellation issue. Needs human review."
  }
}
--------------------------------------------------
USER: My invoice amount is wrong.
{
  "intent": "billing",
  "urgency": "medium",
  "reply": "It seems you have a billing concern. Please send your invoice number for verification.",
  "escalation": {
    "escalate": false,
    "note": "No escalation required."
  }
}
--------------------------------------------------
USER: I need a refund please.
{
  "intent": "refund",
  "urgency": "high",
  "reply": "I understand you want a refund. Please share your order ID so I can assist you further.",
  "escalation": {
    "escalate": true,
    "note": "Urgent refund issue. Needs human review."
  }
}
--------------------------------------------------
USER: Hello, I need help.
{
  "intent": "general_help",
  "urgency": "low",
  "reply": "Sure, I'm here to help. Could you please share more details?",
  "escalation": {
    "escalate": false,
    "note": "No escalation required."
  }
}
--------------------------------------------------