FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY shared ./shared
COPY backend/auth-service ./backend/auth-service
RUN pnpm install --filter @ai-service-desk/auth-service... --frozen-lockfile=false
RUN pnpm --filter @ai-service-desk/auth-service build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app ./
EXPOSE 4001
CMD ["pnpm", "--filter", "@ai-service-desk/auth-service", "start"]

