# Docker Nginx Setup

## Overview

The LANagrafica frontend is now containerized using a multi-stage Docker build with Nginx for production-grade static file serving.

## Architecture

### Build Process

1. **Stage 1 - Build**: Node.js 18 builds the Vite/React/TypeScript application
2. **Stage 2 - Runtime**: Nginx Alpine serves the static files on port 80

### Runtime Environment Configuration

The application uses runtime environment variable injection for Kubernetes compatibility:

- **Configuration files**: `src/lib/auth0-config.ts` and `src/lib/api-config.ts`
- **Priority**: `window.ENV` (runtime) > `import.meta.env` (build-time)
- **Generated file**: `/usr/share/nginx/html/env.js` created at container startup

### Environment Variables

Required environment variables (injected at runtime):

```bash
VITE_AUTH0_DOMAIN          # Auth0 tenant domain
VITE_AUTH0_CLIENT_ID       # Auth0 application client ID
VITE_AUTH0_AUDIENCE        # Auth0 API audience
VITE_API_BASE_URL          # Backend API base URL
VITE_API_GATEWAY_PORT      # Backend API gateway port (default: 8765)
VITE_API_VERSION           # Backend API version path (default: /api/v1)
```

## Dockerfile Details

### Key Features

- **Multi-stage build**: Separates build and runtime for smaller image size
- **Nginx Alpine**: Lightweight production-ready web server (~45MB base image)
- **Runtime config**: Generates `env.js` at container startup via entrypoint script
- **Custom Nginx config**: Includes SPA routing, gzip, security headers, health check
- **Port 80**: Standard HTTP port (matches Helm chart expectations)

### Nginx Configuration (`nginx.conf`)

- **SPA routing**: All routes serve `index.html` for React Router
- **Gzip compression**: Enabled for text and JavaScript assets
- **Caching**: Static assets cached for 1 year with immutable flag
- **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Health check**: `/health` endpoint returns 200 OK

### Entrypoint Script

Located at `/docker-entrypoint.d/40-generate-env-config.sh`:

- Runs automatically before Nginx starts (Nginx official image pattern)
- Generates `env.js` from environment variables
- Logs confirmation message
- Numbering (40-) ensures it runs after default Nginx entrypoint scripts

## Building the Image

```bash
cd /home/dbragalo/repos/bragarelli/lanagrafica-source/lanagrafica-fe

# Build locally
docker build -t lanagrafica-fe:latest .

# Build with specific tag (matching CI)
docker build -t docker.io/arc0t/lanagrafica-fe:1.0.0-dev .
```

## Running Locally

```bash
# Run with environment variables
docker run -d \
  --name lanagrafica-fe \
  -p 8080:80 \
  -e VITE_AUTH0_DOMAIN=your-domain.auth0.com \
  -e VITE_AUTH0_CLIENT_ID=your-client-id \
  -e VITE_AUTH0_AUDIENCE=your-audience \
  -e VITE_API_BASE_URL=https://api.example.com \
  -e VITE_API_GATEWAY_PORT=8765 \
  -e VITE_API_VERSION=/api/v1 \
  lanagrafica-fe:latest

# Check logs
docker logs lanagrafica-fe

# Verify env.js was generated
docker exec lanagrafica-fe cat /usr/share/nginx/html/env.js

# Access application
open http://localhost:8080
```

## Testing

```bash
# Test health check endpoint
curl http://localhost:8080/health

# Test main page
curl -I http://localhost:8080/

# Test SPA routing (should return index.html)
curl -I http://localhost:8080/members

# Verify environment config in browser
# Open http://localhost:8080 and check console:
# Should see "[auth0-config.ts] Auth0 configuration: ..." logs
```

## Kubernetes/Helm Integration

The Dockerfile is designed to work seamlessly with Helm charts:

- **Port**: Exposes port 80 (standard Kubernetes service port)
- **Environment variables**: Injected via ConfigMap/Secret in Helm values
- **Health check**: `/health` endpoint for liveness/readiness probes
- **No CMD override needed**: Nginx starts automatically via base image entrypoint

### Example Helm Values

```yaml
image:
  repository: docker.io/arc0t/lanagrafica-fe
  tag: 1.0.0-dev
  pullPolicy: IfNotPresent

env:
  - name: VITE_AUTH0_DOMAIN
    value: "lanagrafica101roma.eu.auth0.com"
  - name: VITE_AUTH0_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: auth0-credentials
        key: client-id
  - name: VITE_AUTH0_AUDIENCE
    value: "lanagrafica-authJWT"
  - name: VITE_API_BASE_URL
    value: "https://lanagrafica.101roma.club"
  - name: VITE_API_GATEWAY_PORT
    value: "8765"
  - name: VITE_API_VERSION
    value: "/api/v1"

service:
  type: ClusterIP
  port: 80
  targetPort: 80

livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker logs lanagrafica-fe

# Common issues:
# - Missing environment variables (app will work but config will be empty strings)
# - Port 80 already in use (change -p 8080:80 to different port)
```

### env.js not generated

```bash
# Verify entrypoint script exists and is executable
docker exec lanagrafica-fe ls -la /docker-entrypoint.d/40-generate-env-config.sh

# Check if env.js exists
docker exec lanagrafica-fe ls -la /usr/share/nginx/html/env.js

# Manually trigger generation
docker exec lanagrafica-fe /docker-entrypoint.d/40-generate-env-config.sh
docker exec lanagrafica-fe cat /usr/share/nginx/html/env.js
```

### Application can't connect to backend

```bash
# Check browser console for config values
# Should see logs from auth0-config.ts and api-config.ts

# Verify env.js contents
docker exec lanagrafica-fe cat /usr/share/nginx/html/env.js

# Check if environment variables were passed correctly
docker exec lanagrafica-fe env | grep VITE_
```

### SPA routing not working (404 on refresh)

```bash
# Verify nginx.conf is correctly copied
docker exec lanagrafica-fe cat /etc/nginx/conf.d/default.conf

# Check Nginx logs
docker logs lanagrafica-fe 2>&1 | grep nginx
```

## CI/CD Pipeline

The image is automatically built by CI and tagged as:
- `docker.io/arc0t/lanagrafica-fe:1.0.0-dev`

The pipeline should:
1. Build the Docker image
2. Push to Docker Hub
3. Update Helm chart image tag
4. Deploy to Kubernetes

## Security Considerations

- **No secrets in image**: All sensitive config via runtime environment variables
- **Security headers**: Added via Nginx configuration
- **CSP headers**: Configured in `index.html` for Auth0 compatibility
- **Minimal attack surface**: Alpine-based image, no unnecessary packages
- **Non-root**: Nginx runs as nginx user (default in official image)

## Performance

- **Image size**: ~50-60MB (Node.js build stage discarded)
- **Build time**: ~2-3 minutes (depends on npm install)
- **Startup time**: <1 second (Nginx + env.js generation)
- **Memory usage**: ~10-20MB at idle
- **Gzip enabled**: Reduces transfer size by ~70% for text assets

## Migration from `serve`

### Changes Made

1. **Base image**: Changed from `node:18-slim` to `nginx:alpine`
2. **Port**: Changed from 3000 to 80
3. **Server**: Replaced `serve` with Nginx
4. **Config**: Added custom `nginx.conf` for SPA routing and optimization
5. **Entrypoint**: Moved env.js generation to `/docker-entrypoint.d/` pattern

### Benefits

- **Production-ready**: Nginx is battle-tested for static file serving
- **Performance**: Better caching, compression, and connection handling
- **Standard port**: Port 80 is expected by most Kubernetes setups
- **Smaller image**: ~50MB vs ~180MB with Node.js
- **Lower memory**: ~10MB vs ~50MB with Node.js
- **Health checks**: Native support with `/health` endpoint

### No Breaking Changes

- Environment variable handling unchanged
- Application code unchanged
- `window.ENV` pattern preserved
- Runtime configuration still works

## Future Enhancements

Potential improvements (not required now):

- Add HTTPS support with TLS certificates
- Implement rate limiting in Nginx
- Add request logging to stdout for better observability
- Implement cache busting for `env.js` (if needed)
- Add Nginx status endpoint for monitoring
- Implement Content-Security-Policy headers in Nginx (currently in HTML)
