import type { KnowledgeDocumentInput } from "../src/clients/rag.client.js";

export const knowledgeDocuments: KnowledgeDocumentInput[] = [
  {
    title: "VPN Secure Access troubleshooting for hybrid banking staff",
    source: "workplace-support/vpn-secure-access.md",
    status: "published",
    content:
      "VPN Secure Access supports hybrid banking staff who need internal applications from home or branch networks. First confirm the internet connection is stable and the employee can open public websites. Restart the VPN client and sign in again with MFA Authenticator. If the error says certificate expired, collect the device asset ID and escalate to Network Access Support. If the error says account locked or MFA failed, route the case to Identity Access Management. Never ask the employee to share passwords, tokens, or customer information in chat."
  },
  {
    title: "MFA reset procedure for new phone or lost authenticator",
    source: "identity/mfa-reset-guide.md",
    status: "published",
    content:
      "When an employee changes phone or loses the authenticator app, verify their corporate email and manager approval before resetting MFA. For standard workplace users, create an Identity Access Management ticket with category Security and priority P3. For payments, risk, or production support roles, use priority P2 when access blocks a scheduled operational activity. The service desk agent should record the device change reason and remind the employee not to approve unexpected MFA prompts."
  },
  {
    title: "Payments Operations Console access request workflow",
    source: "banking-apps/payments-operations-access.md",
    status: "published",
    content:
      "Payments Operations Console is a sensitive banking operations application. Access requests require business justification, manager approval, and Payments Technology owner approval. The chatbot should collect employee department, requested role, production or non-production environment, and duration of access. If the request is urgent for payment processing, mark priority P2 and assign to Payments Application Support. Do not grant access directly from chat; create a ServiceNow-style ticket for approval workflow."
  },
  {
    title: "Azure DevOps production pipeline access policy",
    source: "cloud-platform/azure-devops-access.md",
    status: "published",
    content:
      "Azure DevOps production pipeline permissions are controlled by Cloud Platform Engineering. A platform engineer must provide project name, repository, pipeline name, target environment, access duration, and change ticket reference. Production deploy access requires approval from the product owner and platform lead. Standard requests are P3. If a production incident is active and deployment is blocked, classify as P2 and assign to Cloud Platform Engineering."
  },
  {
    title: "Workplace support incident priority matrix",
    source: "service-desk/priority-matrix.md",
    status: "published",
    content:
      "Use P1 for enterprise-wide outage or customer-impacting critical banking service disruption. Use P2 for a major business process blocked for a department or production support group. Use P3 for a single employee issue with available workaround. Use P4 for low urgency requests, information requests, or planned service changes. The chatbot should recommend ticket creation when priority is P1 or P2, when intent confidence is low, or when the user explicitly requests human support."
  },
  {
    title: "Password reset guide for corporate banking employees",
    source: "identity/password-reset.md",
    status: "published",
    content:
      "Employees should use the corporate password reset portal for standard password changes. If the reset portal fails, collect the username, corporate email, and error message. For locked accounts affecting VPN, email, or core banking support tools, create an Identity Access Management ticket. The service desk should never request the old password. If the user reports suspicious login prompts, escalate as Security priority P2."
  }
];
