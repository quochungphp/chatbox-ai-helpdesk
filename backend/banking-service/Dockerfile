FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY shared ./shared
COPY backend/banking-service ./backend/banking-service
RUN pnpm install --filter @ai-service-desk/banking-service... --frozen-lockfile=false
RUN pnpm --filter @ai-service-desk/banking-service build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app ./
EXPOSE 4002
CMD ["pnpm", "--filter", "@ai-service-desk/banking-service", "start"]

