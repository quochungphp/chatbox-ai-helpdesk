import { Activity, BookOpen, MessageSquareText, ShieldCheck, Ticket } from "lucide-react";
import { ChatPanel } from "./features/chat/ChatPanel";
import { DashboardPanel } from "./features/dashboard/DashboardPanel";
import { KnowledgeBasePanel } from "./features/knowledge-base/KnowledgeBasePanel";
import { TicketsPanel } from "./features/tickets/TicketsPanel";

export function App() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-bank" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-bank">NAB Demo</p>
            <h1 className="text-lg font-semibold">AI Service Desk</h1>
          </div>
        </div>
        <nav className="mt-8 space-y-2 text-sm font-medium text-slate-600">
          <a className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-ink" href="#chat">
            <MessageSquareText className="h-4 w-4" /> Chat
          </a>
          <a className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="#dashboard">
            <Activity className="h-4 w-4" /> Dashboard
          </a>
          <a className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="#tickets">
            <Ticket className="h-4 w-4" /> Tickets
          </a>
          <a className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="#knowledge-base">
            <BookOpen className="h-4 w-4" /> Knowledge Base
          </a>
        </nav>
      </aside>
      <section className="lg:pl-64">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
          <ChatPanel />
          <div className="space-y-6">
            <DashboardPanel />
            <TicketsPanel />
            <KnowledgeBasePanel />
          </div>
        </div>
      </section>
    </main>
  );
}

