FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY shared ./shared
COPY apps/frontend ./apps/frontend
RUN pnpm install --filter @ai-service-desk/frontend... --frozen-lockfile=false
RUN pnpm --filter @ai-service-desk/frontend build
EXPOSE 3000
CMD ["pnpm", "--filter", "@ai-service-desk/frontend", "preview"]

