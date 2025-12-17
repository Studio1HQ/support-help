import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { findCustomerById } from "../utils/dataLoader";

/**
 * Decide if customer issue should be escalated to human agent
 */
export const escalationDecisionTool = tool(
  async ({ customerId, intent, urgency }) => {
    let shouldEscalate = false;
    let reason = "";
    let assignedTo: "billing" | "tech" | "retention" = "tech";
    let priority: 1 | 2 | 3 = 3;
    
    // Always escalate high urgency
    if (urgency === "high") {
      shouldEscalate = true;
      reason = "High urgency issue detected";
      priority = 1;
    }
    
    // Check customer data if available
    if (customerId) {
      const customer = findCustomerById(customerId);
      
      if (customer) {
        // Escalate if customer is at risk of churning
        if (customer.Churn === "Yes") {
          shouldEscalate = true;
          reason = reason ? `${reason}; Customer at risk of churn` : "Customer at risk of churn - retention priority";
          assignedTo = "retention";
          priority = 1;
        }
        
        // Escalate for senior citizens
        if (customer.SeniorCitizen === "1") {
          shouldEscalate = true;
          reason = reason ? `${reason}; Senior citizen requiring special assistance` : "Senior citizen requiring special assistance";
          if (priority > 2) priority = 2;
        }
        
        // High-value customers (tenure > 50 months or charges > $80)
        if (parseInt(customer.tenure) > 50 || parseFloat(customer.MonthlyCharges) > 80) {
          shouldEscalate = true;
          reason = reason ? `${reason}; High-value customer` : "High-value customer - priority handling";
          if (priority > 2) priority = 2;
        }
      }
    }
    
    // Assign to appropriate department based on intent
    if (intent === "billing_issue" || intent === "payment_issue") {
      assignedTo = "billing";
    } else if (intent === "cancellation") {
      assignedTo = "retention";
      shouldEscalate = true;
      reason = reason ? `${reason}; Cancellation request` : "Cancellation request - requires retention team";
      priority = 1;
    } else if (intent === "service_outage" || intent === "tech_support") {
      assignedTo = "tech";
    }
    
    // Generate ticket ID if escalating
    const ticketId = shouldEscalate 
      ? `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      : undefined;
    
    return JSON.stringify({
      required: shouldEscalate,
      reason: reason || "No escalation needed - can be handled by AI assistant",
      ticketId: ticketId,
      assignedTo: assignedTo,
      priority: priority,
    });
  },
  {
    name: "checkEscalation",
    description: "Determine if the customer issue should be escalated to a human agent based on urgency, customer profile, and issue type.",
    schema: z.object({
      customerId: z.string().optional().describe("The customer ID if available"),
      intent: z.string().describe("The classified intent category"),
      urgency: z.enum(["low", "medium", "high"]).describe("The urgency level"),
    }),
  }
);