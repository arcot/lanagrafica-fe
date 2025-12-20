# Multi-stage Dockerfile for LANagrafica Frontend (React + TypeScript + Vite)
# Uses Nginx for production-grade static file serving with runtime env config

# Stage 1: Build the application
FROM node:18 AS build

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (no env vars needed at build time)
RUN pnpm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create entrypoint script that generates env.js at runtime
COPY <<'EOF' /docker-entrypoint.d/40-generate-env-config.sh
#!/bin/sh
# Generate runtime environment configuration
cat <<ENDOFFILE > /usr/share/nginx/html/env.js
window.ENV = {
  VITE_AUTH0_DOMAIN: "$VITE_AUTH0_DOMAIN",
  VITE_AUTH0_CLIENT_ID: "$VITE_AUTH0_CLIENT_ID",
  VITE_AUTH0_AUDIENCE: "$VITE_AUTH0_AUDIENCE",
  VITE_API_BASE_URL: "$VITE_API_BASE_URL",
  VITE_API_GATEWAY_PORT: "$VITE_API_GATEWAY_PORT",
  VITE_API_VERSION: "$VITE_API_VERSION"
};
ENDOFFILE
echo "Generated runtime environment configuration at /usr/share/nginx/html/env.js"
EOF

# Make the entrypoint script executable
RUN chmod +x /docker-entrypoint.d/40-generate-env-config.sh

# Expose port 80 (standard HTTP port for Nginx)
EXPOSE 80

# Nginx base image already has proper entrypoint that will run scripts in /docker-entrypoint.d/
# and then start nginx in foreground mode
