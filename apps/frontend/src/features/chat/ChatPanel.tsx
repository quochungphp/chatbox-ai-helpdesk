import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, CheckCircle2, FileText, SendHorizontal, TicketCheck } from "lucide-react";
import { useState } from "react";
import type { ChatResponse } from "@ai-service-desk/shared/types";
import { sendChatMessage } from "../../services/api/chat";

type UiMessage = {
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse;
};

const demoUserId = "employee.vn@demo-bank.local";

export function ChatPanel() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      role: "assistant",
      content: "Describe your IT issue and I will try to resolve it or create a service desk ticket."
    }
  ]);

  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (response: ChatResponse) => {
      setConversationId(response.conversationId);
      setMessages((current) => [...current, { role: "assistant", content: response.answer, response }]);
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    }
  });

  function submit() {
    const trimmed = message.trim();
    if (!trimmed || mutation.isPending) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setMessage("");
    mutation.mutate({ conversationId, userId: demoUserId, message: trimmed });
  }

  return (
    <section id="chat" className="min-h-[calc(100vh-2.5rem)] rounded-md border border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-5 py-4">
        <p className="text-sm font-medium uppercase tracking-wide text-bank">AI Automation</p>
        <h2 className="text-2xl font-semibold">Service Desk Chat</h2>
      </header>
      <div className="flex h-[calc(100vh-11rem)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={item.role === "user" ? "flex justify-end" : "flex justify-start"}>
              {item.role === "user" ? <UserBubble content={item.content} /> : <AssistantBubble item={item} />}
            </div>
          ))}
          {mutation.isPending ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Bot className="h-4 w-4 animate-pulse text-action" />
              Assistant is checking RAG, AI, banking policy, and ticket workflow...
            </div>
          ) : null}
          {mutation.isError ? <p className="text-sm text-red-600">{mutation.error.message}</p> : null}
        </div>
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-action focus:ring-2 focus:ring-action/20"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              placeholder="I need access to Payments Operations Console"
            />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-action text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={mutation.isPending}
              onClick={submit}
              type="button"
              title="Send"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function UserBubble({ content }: { content: string }) {
  return <p className="max-w-[78%] rounded-md bg-bank px-4 py-3 text-sm leading-6 text-white">{content}</p>;
}

function AssistantBubble({ item }: { item: UiMessage }) {
  return (
    <div className="max-w-[86%] rounded-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-800">
      <p>{item.content}</p>
      {item.response ? (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 font-medium text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-action" />
              {item.response.intent}
            </span>
            <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-700">
              {Math.round(item.response.confidence * 100)}% confidence
            </span>
          </div>
          {item.response.ticket ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="flex items-center gap-2 font-semibold text-amber-900">
                <TicketCheck className="h-4 w-4" />
                {item.response.ticket.ticketNumber} created
              </p>
              <p className="mt-1 text-xs text-amber-900">
                {item.response.ticket.priority} · {item.response.ticket.assignmentGroup}
              </p>
            </div>
          ) : null}
          {item.response.sources?.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Sources</p>
              <div className="space-y-2">
                {item.response.sources.slice(0, 3).map((source) => (
                  <div key={`${source.title}-${source.source}`} className="flex items-start gap-2 rounded-md bg-white p-2 text-xs text-slate-600">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action" />
                    <span>
                      <span className="font-medium text-slate-800">{source.title}</span>
                      <br />
                      {source.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {item.response.suggestedActions.map((action) => (
              <span key={action} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                {action}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
