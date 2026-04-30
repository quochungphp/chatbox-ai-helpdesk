export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: ApiError;
    };

export type UserRole = "employee" | "service_desk_agent" | "admin" | "platform_engineer";

export type TicketPriority = "P1" | "P2" | "P3" | "P4";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed" | "cancelled";

export type SupportIntent =
  | "vpn_issue"
  | "email_issue"
  | "password_reset"
  | "software_installation"
  | "access_request"
  | "laptop_performance"
  | "network_issue"
  | "mfa_issue"
  | "unknown";

export type Ticket = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignmentGroup: string;
  createdAt: string;
  conversationId?: string;
  createdBy?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type ChatRequest = {
  conversationId?: string;
  userId: string;
  message: string;
};

export type ChatResponse = {
  conversationId: string;
  answer: string;
  intent: SupportIntent;
  confidence: number;
  suggestedActions: string[];
  ticket?: Ticket;
  sources?: Array<{
    title: string;
    source: string;
  }>;
};

export type KnowledgeArticle = {
  id: string;
  title: string;
  content: string;
  source: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
};

