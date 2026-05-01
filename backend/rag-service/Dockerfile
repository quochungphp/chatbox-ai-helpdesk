FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9.12.0
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY shared ./shared
COPY backend/rag-service ./backend/rag-service
RUN pnpm install --filter @ai-service-desk/rag-service... --frozen-lockfile=false
RUN pnpm --filter @ai-service-desk/rag-service prisma:generate
RUN pnpm --filter @ai-service-desk/rag-service build
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9.12.0
COPY --from=build /app ./
EXPOSE 4005
CMD ["pnpm", "--filter", "@ai-service-desk/rag-service", "start"]
