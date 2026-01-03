# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy server workspace
COPY apps/server ./apps/server

# Install dependencies
RUN npm install -g pnpm@10.0.0 && pnpm install --frozen-lockfile

# Build
RUN cd apps/server && pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.0.0

# Copy package files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy built server code
COPY --from=builder /app/apps/server ./apps/server

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "apps/server/dist/index.js"]
