# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy server and web workspaces
COPY apps/server ./apps/server
COPY apps/web ./apps/web

# Install dependencies
RUN npm install -g pnpm@10.0.0 && pnpm install --prod=false

# Build server and web from workspace root
RUN pnpm --filter @altstore/server build && pnpm --filter @altstore/web build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.0.0

# Copy package files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy OpenAPI spec
COPY openapi.yaml ./

# Copy built server code (includes scripts directory)
COPY --from=builder /app/apps/server ./apps/server

# Copy built frontend (for unified single-host serving from /manager route)
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Copy node_modules from builder (important for dev mode)
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "apps/server/dist/index.js"]
