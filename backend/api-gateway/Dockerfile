FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY shared ./shared
COPY backend/api-gateway ./backend/api-gateway
RUN pnpm install --filter @ai-service-desk/api-gateway... --frozen-lockfile=false
RUN pnpm --filter @ai-service-desk/api-gateway build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app ./
EXPOSE 8080
CMD ["pnpm", "--filter", "@ai-service-desk/api-gateway", "start"]

