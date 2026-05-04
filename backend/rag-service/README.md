# RAG Service

RAG Service owns knowledge base ingestion and retrieval for grounded chatbot answers.

## Responsibilities

- Store knowledge base documents.
- Split documents into searchable chunks.
- Search published chunks with lexical scoring for local demo.
- Return source metadata for citations.
- Provide a path to future pgvector/embedding-based retrieval.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Service health |
| `GET` | `/api/kb/articles` | List knowledge articles |
| `POST` | `/api/kb/articles` | Create and index a knowledge article |
| `POST` | `/api/kb/search` | Search knowledge chunks |

## Related Services

- `api-gateway`: routes `/api/kb/*` to this service.
- `chatbot-service`: searches RAG before answering.
- `simulator`: seeds demo knowledge articles.
- `postgres`: stores documents and chunks in `rag_db`.
- `ai-service`: future embedding generation can be added behind this boundary.

## Environment

```text
PORT=4005
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/rag_db
```

## Local Commands

```bash
corepack pnpm --filter @ai-service-desk/rag-service dev
corepack pnpm --filter @ai-service-desk/rag-service typecheck
```
