import type { ChunkInput } from "../types/knowledge.type.js";

const defaultChunkWords = 90;
const defaultOverlapWords = 15;

export class ChunkingService {
  chunk(content: string): ChunkInput[] {
    const words = normalize(content).split(" ").filter(Boolean);

    if (words.length === 0) {
      return [];
    }

    const chunks: ChunkInput[] = [];
    let start = 0;

    while (start < words.length) {
      const chunkWords = words.slice(start, start + defaultChunkWords);
      chunks.push({
        chunkIndex: chunks.length,
        content: chunkWords.join(" "),
        tokenCount: chunkWords.length,
        metadata: {
          startWord: start,
          endWord: start + chunkWords.length - 1
        }
      });

      start += defaultChunkWords - defaultOverlapWords;
    }

    return chunks;
  }
}

function normalize(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}
