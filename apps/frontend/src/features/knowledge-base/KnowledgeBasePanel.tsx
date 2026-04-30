import { useQuery } from "@tanstack/react-query";
import { listKnowledgeArticles } from "../../services/api/knowledge-base";

export function KnowledgeBasePanel() {
  const { data } = useQuery({ queryKey: ["knowledge-articles"], queryFn: listKnowledgeArticles });

  return (
    <section id="knowledge-base" className="rounded-md border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Knowledge Base</h2>
      <div className="mt-4 space-y-3">
        {(data ?? []).slice(0, 3).map((article) => (
          <article key={article.id} className="rounded-md border border-slate-200 p-3">
            <p className="text-sm font-semibold">{article.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{article.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
