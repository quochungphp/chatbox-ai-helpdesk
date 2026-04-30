FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY shared ./shared
COPY backend/audit-service ./backend/audit-service
RUN pnpm install --filter @ai-service-desk/audit-service... --frozen-lockfile=false
RUN pnpm --filter @ai-service-desk/audit-service build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app ./
EXPOSE 4008
CMD ["pnpm", "--filter", "@ai-service-desk/audit-service", "start"]

