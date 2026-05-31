# Multi-stage build for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend .

# Build frontend
RUN npm run build

# Frontend production stage
FROM node:18-alpine AS frontend

WORKDIR /app

# Install simple HTTP server
RUN npm install -g serve

# Copy built frontend from builder
COPY --from=frontend-builder /frontend/dist ./dist

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]
