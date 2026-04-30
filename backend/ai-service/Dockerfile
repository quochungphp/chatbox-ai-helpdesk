FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY shared ./shared
COPY backend/ai-service ./backend/ai-service
RUN pnpm install --filter @ai-service-desk/ai-service... --frozen-lockfile=false
RUN pnpm --filter @ai-service-desk/ai-service build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app ./
EXPOSE 4004
CMD ["pnpm", "--filter", "@ai-service-desk/ai-service", "start"]

