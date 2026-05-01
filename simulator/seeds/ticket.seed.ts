import type { TicketInput } from "../src/clients/ticket.client.js";

export const ticketSeeds: TicketInput[] = [
  {
    title: "Employee cannot access Payments Operations Console",
    description:
      "Payments Technology employee reports access denied after role change. Business justification and manager approval required.",
    category: "Access Management",
    priority: "P2",
    assignmentGroup: "Payments Application Support",
    createdBy: "employee.vn@demo-bank.local"
  },
  {
    title: "MFA reset after phone replacement",
    description: "Employee changed phone and cannot approve MFA prompts for VPN Secure Access.",
    category: "Security",
    priority: "P3",
    assignmentGroup: "Identity Access Management",
    createdBy: "employee.vn@demo-bank.local"
  },
  {
    title: "Azure DevOps production pipeline permission request",
    description: "Platform engineer requests temporary production deployment access with change ticket reference.",
    category: "Cloud Platform",
    priority: "P3",
    assignmentGroup: "Cloud Platform Engineering",
    createdBy: "platform.engineer@demo-bank.local"
  }
];
