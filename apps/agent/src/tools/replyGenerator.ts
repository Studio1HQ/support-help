import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { findCustomerById } from "../utils/dataLoader";

/**
 * Generate personalized reply based on customer context
 */
export const replyGeneratorTool = tool(
  async ({ customerId, intent, message }) => {
    let reply = "";
    const suggestedActions: string[] = [];
    
    // Get customer data if available
    const customer = customerId ? findCustomerById(customerId) : null;
    
    // Generate reply based on intent
    switch (intent) {
      case "billing_issue":
        if (customer) {
          reply = `I understand you have a billing concern. I can see you're currently on our ${customer.Contract} contract with a monthly charge of $${customer.MonthlyCharges}. Let me help you review your charges.`;
          suggestedActions.push("View detailed bill", "Check for discounts", "Speak to billing specialist");
        } else {
          reply = "I'd be happy to help with your billing concern. Could you please provide your customer ID so I can review your account details?";
          suggestedActions.push("Provide customer ID", "View general billing info");
        }
        break;
        
      case "service_outage":
        reply = customer 
          ? `I'm sorry you're experiencing service issues with your ${customer.InternetService} connection. Let me check the status and help troubleshoot.`
          : "I apologize for the service disruption. Let me help you troubleshoot the issue.";
        suggestedActions.push("Run diagnostics", "Check service status", "Schedule technician visit");
        break;
        
      case "cancellation":
        if (customer) {
          reply = `I'm sorry to hear you're considering canceling your service. You've been with us for ${customer.tenure} months. Before you go, let me see if I can help address any concerns or offer you a better plan.`;
          suggestedActions.push("Explore better plans", "Discuss concerns", "Special retention offer");
        } else {
          reply = "I understand you're considering canceling. I'd like to help address any concerns you have. Could you share your customer ID?";
          suggestedActions.push("Provide customer ID", "Share concerns");
        }
        break;
        
      case "tech_support":
        reply = customer
          ? `I'll help you with your technical issue. I see you have ${customer.InternetService} internet service. What specific problem are you experiencing?`
          : "I'm here to help with your technical issue. Please describe what's happening.";
        suggestedActions.push("Describe issue", "Try basic troubleshooting", "Connect to tech support");
        break;
        
      case "upgrade_request":
        if (customer) {
          reply = `Great! You're currently on ${customer.InternetService} with a ${customer.Contract} contract at $${customer.MonthlyCharges}/month. Let me show you our upgrade options.`;
          suggestedActions.push("View premium plans", "Compare pricing", "Upgrade now");
        } else {
          reply = "I'd love to help you upgrade! What type of service are you looking to improve?";
          suggestedActions.push("Internet upgrade", "Phone service", "Bundle options");
        }
        break;
        
      case "payment_issue":
        reply = customer
          ? `I see you're using ${customer.PaymentMethod} for payments. Let me help resolve this payment issue.`
          : "I can help with your payment issue. Let me look into this for you.";
        suggestedActions.push("Update payment method", "Make manual payment", "Set up autopay");
        break;
        
      default: // general_inquiry
        reply = "Hello! I'm here to help you with any questions about your telecom services. How can I assist you today?";
        suggestedActions.push("Check account status", "View services", "Billing inquiry", "Technical support");
    }
    
    return JSON.stringify({
      message: reply,
      suggestedActions: suggestedActions,
    });
  },
  {
    name: "generateReply",
    description: "Generate a personalized response based on customer information and their intent.",
    schema: z.object({
      customerId: z.string().optional().describe("The customer ID if available"),
      intent: z.string().describe("The classified intent category"),
      message: z.string().describe("The original customer message"),
    }),
  }
);