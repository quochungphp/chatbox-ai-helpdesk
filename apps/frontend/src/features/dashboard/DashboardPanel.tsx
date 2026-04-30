import { useQuery } from "@tanstack/react-query";
import { getAdminMetrics } from "../../services/api/admin";

export function DashboardPanel() {
  const { data } = useQuery({ queryKey: ["admin-metrics"], queryFn: getAdminMetrics });

  return (
    <section id="dashboard" className="rounded-md border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Conversations" value={data?.totalConversations ?? 0} />
        <Metric label="Tickets" value={data?.totalTickets ?? 0} />
        <Metric label="Confidence" value={`${Math.round((data?.averageResolutionConfidence ?? 0) * 100)}%`} />
        <Metric label="Escalated" value={data?.escalatedIssues ?? 0} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
