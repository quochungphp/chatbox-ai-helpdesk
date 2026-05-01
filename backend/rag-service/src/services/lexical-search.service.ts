import type { KnowledgeSearchCandidate, KnowledgeSearchResult } from "../types/knowledge.type.js";

const stopWords = new Set(["a", "an", "and", "are", "for", "i", "is", "it", "of", "on", "or", "the", "to", "with"]);

export class LexicalSearchService {
  rank(query: string, candidates: KnowledgeSearchCandidate[], limit: number): KnowledgeSearchResult[] {
    const queryTerms = tokenize(query);

    if (queryTerms.length === 0) {
      return [];
    }

    return candidates
      .map((candidate) => ({
        article: {
          id: candidate.document.id,
          title: candidate.document.title,
          content: candidate.content,
          source: candidate.document.source,
          status: candidate.document.status.toLowerCase() as "draft" | "published" | "archived",
          updatedAt: candidate.document.updatedAt.toISOString()
        },
        chunk: {
          id: candidate.id,
          chunkIndex: candidate.chunkIndex,
          content: candidate.content
        },
        score: score(queryTerms, `${candidate.document.title} ${candidate.content}`)
      }))
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);
  }
}

function score(queryTerms: string[], text: string): number {
  const textTerms = new Set(tokenize(text));
  const matched = queryTerms.filter((term) => textTerms.has(term)).length;
  return Number((matched / queryTerms.length).toFixed(4));
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 1 && !stopWords.has(term));
}
