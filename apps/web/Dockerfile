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

# Install pnpm globally
RUN npm install -g pnpm@10.0.0 && npm install -g serve

# Copy package files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy built web app from builder
COPY --from=builder /app/apps/web ./apps/web

# Copy node_modules from builder for dev mode
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5173

ENV NODE_ENV=production

CMD ["serve", "-s", "dist", "-l", "5173"]
