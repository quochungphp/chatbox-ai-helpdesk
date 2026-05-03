import { useQuery } from "@tanstack/react-query";
import { listTickets } from "../../services/api/tickets";

export function TicketsPanel() {
  const { data } = useQuery({ queryKey: ["tickets"], queryFn: listTickets });

  return (
    <section id="tickets" className="rounded-md border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Recent Tickets</h2>
      <div className="mt-4 space-y-3">
        {(data ?? []).slice(0, 4).map((ticket) => (
          <article key={ticket.id} className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{ticket.ticketNumber}</p>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{ticket.priority}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{ticket.title}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              {ticket.status} · {ticket.assignmentGroup}
            </p>
          </article>
        ))}
        {data?.length === 0 ? <p className="text-sm text-slate-500">No tickets created yet.</p> : null}
      </div>
    </section>
  );
}
