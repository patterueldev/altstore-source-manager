# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy web workspace
COPY apps/web ./apps/web

# Install dependencies
RUN npm install -g pnpm@10.0.0 && pnpm install --frozen-lockfile

# Build
RUN cd apps/web && pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install a lightweight HTTP server to serve the built app
RUN npm install -g serve

# Copy built web app from builder
COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 5173

ENV NODE_ENV=production

CMD ["serve", "-s", "dist", "-l", "5173"]
