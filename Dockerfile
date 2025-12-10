# Multi-stage Dockerfile for LANagrafica Frontend (React + TypeScript + Vite)
# Uses runtime environment configuration for K8s compatibility

# Stage 1: Build the application
FROM node:18 AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application (no env vars needed at build time)
RUN npm run build

# Stage 2: Serve with node serve (runtime env config)
FROM node:18-slim

WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# Install serve globally
RUN npm install -g serve

# Create startup script that generates env.js at runtime
COPY <<'EOF' /app/generate-env-config.sh
#!/bin/sh
cat <<ENDOFFILE > /app/dist/env.js
window.ENV = {
  VITE_AUTH0_DOMAIN: "$VITE_AUTH0_DOMAIN",
  VITE_AUTH0_CLIENT_ID: "$VITE_AUTH0_CLIENT_ID",
  VITE_AUTH0_AUDIENCE: "$VITE_AUTH0_AUDIENCE",
  VITE_API_BASE_URL: "$VITE_API_BASE_URL",
  VITE_API_GATEWAY_PORT: "$VITE_API_GATEWAY_PORT",
  VITE_API_VERSION: "$VITE_API_VERSION"
};
ENDOFFILE
serve -s dist -l 3000
EOF

RUN chmod +x /app/generate-env-config.sh

# Expose port 3000
EXPOSE 3000

# Start serve with runtime env config generation
CMD ["/app/generate-env-config.sh"]
