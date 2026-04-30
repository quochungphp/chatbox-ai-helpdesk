import { useMutation } from "@tanstack/react-query";
import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import type { ChatResponse } from "@ai-service-desk/shared/types";
import { sendChatMessage } from "../../services/api/chat";

type UiMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatPanel() {
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
      setMessages((current) => [...current, { role: "assistant", content: response.answer }]);
    }
  });

  function submit() {
    const trimmed = message.trim();
    if (!trimmed || mutation.isPending) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setMessage("");
    mutation.mutate({ conversationId, userId: "usr_001", message: trimmed });
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
              <p
                className={
                  item.role === "user"
                    ? "max-w-[78%] rounded-md bg-bank px-4 py-3 text-sm leading-6 text-white"
                    : "max-w-[78%] rounded-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-800"
                }
              >
                {item.content}
              </p>
            </div>
          ))}
          {mutation.isPending ? <p className="text-sm text-slate-500">Assistant is checking the knowledge base...</p> : null}
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
              placeholder="VPN is not working after MFA approval..."
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
