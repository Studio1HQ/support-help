import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Classify customer intent based on their message
 */
export const intentClassifierTool = tool(
  async ({ message }) => {
    const lowerMessage = message.toLowerCase();
    
    // Keywords for each intent category
    const intentPatterns = {
      billing_issue: ["bill", "charge", "payment", "invoice", "expensive", "cost", "price", "refund"],
      service_outage: ["not working", "down", "outage", "slow", "disconnected", "no internet", "connection"],
      cancellation: ["cancel", "terminate", "stop service", "end subscription", "quit"],
      tech_support: ["help", "support", "issue", "problem", "error", "configure", "setup", "install"],
      upgrade_request: ["upgrade", "faster", "better plan", "fiber", "premium", "more speed"],
      payment_issue: ["payment failed", "can't pay", "declined", "payment error", "autopay"],
      general_inquiry: ["hello", "hi", "info", "question", "how", "what", "when", "where"],
    };
    
    // Count keyword matches for each intent
    let bestIntent = "general_inquiry";
    let maxMatches = 0;
    let matchedKeywords: string[] = [];
    
    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        bestIntent = intent;
        matchedKeywords = matches;
      }
    }
    
    // Determine urgency based on intent and keywords
    let urgency: "low" | "medium" | "high" = "low";
    
    if (bestIntent === "service_outage" || bestIntent === "cancellation" || bestIntent === "payment_issue") {
      urgency = "high";
    } else if (bestIntent === "billing_issue" || bestIntent === "tech_support") {
      urgency = "medium";
    }
    
    // Check for urgency keywords
    const urgentKeywords = ["urgent", "emergency", "immediately", "asap", "critical", "now"];
    if (urgentKeywords.some(kw => lowerMessage.includes(kw))) {
      urgency = "high";
    }
    
    const confidence = maxMatches > 0 ? Math.min(0.5 + (maxMatches * 0.15), 0.95) : 0.6;
    
    return JSON.stringify({
      category: bestIntent,
      urgency: urgency,
      confidence: confidence,
      keywords: matchedKeywords,
    });
  },
  {
    name: "classifyIntent",
    description: "Classify the customer's intent and urgency level based on their message. Returns intent category, urgency level, and confidence score.",
    schema: z.object({
      message: z.string().describe("The customer's message to classify"),
    }),
  }
);