# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init and OpenSSL for Prisma compatibility
RUN apk add --no-cache dumb-init openssl

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy Prisma schema and generated client
COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "run", "start"]
