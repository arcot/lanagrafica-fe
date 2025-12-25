#!/bin/bash
# Test script for Docker Nginx setup
# Usage: ./test-docker.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}LANagrafica Frontend - Docker Nginx Test Script${NC}"
echo "=================================================="
echo ""

# Configuration
IMAGE_NAME="lanagrafica-fe:test"
CONTAINER_NAME="lanagrafica-fe-test"
TEST_PORT=8080

# Test environment variables
export VITE_AUTH0_DOMAIN="test-domain.auth0.com"
export VITE_AUTH0_CLIENT_ID="test-client-id"
export VITE_AUTH0_AUDIENCE="test-audience"
export VITE_API_BASE_URL="https://api.test.com"
export VITE_API_GATEWAY_PORT="8765"
export VITE_API_VERSION="/api/v1"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

echo -e "${YELLOW}Step 1: Building Docker image${NC}"
echo "Image: $IMAGE_NAME"
docker build -t $IMAGE_NAME .
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

echo -e "${YELLOW}Step 2: Starting container${NC}"
echo "Container: $CONTAINER_NAME"
echo "Port: $TEST_PORT -> 80"
docker run -d \
  --name $CONTAINER_NAME \
  -p $TEST_PORT:80 \
  -e VITE_AUTH0_DOMAIN="$VITE_AUTH0_DOMAIN" \
  -e VITE_AUTH0_CLIENT_ID="$VITE_AUTH0_CLIENT_ID" \
  -e VITE_AUTH0_AUDIENCE="$VITE_AUTH0_AUDIENCE" \
  -e VITE_API_BASE_URL="$VITE_API_BASE_URL" \
  -e VITE_API_GATEWAY_PORT="$VITE_API_GATEWAY_PORT" \
  -e VITE_API_VERSION="$VITE_API_VERSION" \
  $IMAGE_NAME

# Wait for container to be ready
echo "Waiting for container to start..."
sleep 3
echo -e "${GREEN}✓ Container started${NC}"
echo ""

echo -e "${YELLOW}Step 3: Verifying container health${NC}"
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✓ Container is running${NC}"
else
    echo -e "${RED}✗ Container is not running${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 4: Checking Nginx configuration${NC}"
if docker exec $CONTAINER_NAME cat /etc/nginx/conf.d/default.conf > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Nginx config exists${NC}"
else
    echo -e "${RED}✗ Nginx config not found${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 5: Verifying env.js generation${NC}"
if docker exec $CONTAINER_NAME test -f /usr/share/nginx/html/env.js; then
    echo -e "${GREEN}✓ env.js exists${NC}"
    echo ""
    echo "Contents of env.js:"
    docker exec $CONTAINER_NAME cat /usr/share/nginx/html/env.js
    echo ""

    # Verify content
    if docker exec $CONTAINER_NAME cat /usr/share/nginx/html/env.js | grep -q "$VITE_AUTH0_DOMAIN"; then
        echo -e "${GREEN}✓ Environment variables correctly injected${NC}"
    else
        echo -e "${RED}✗ Environment variables not found in env.js${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ env.js not found${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 6: Testing HTTP endpoints${NC}"

# Test health check
echo "Testing /health endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/health)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check returned 200${NC}"
else
    echo -e "${RED}✗ Health check returned $HTTP_CODE${NC}"
    exit 1
fi

# Test main page
echo "Testing / endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Main page returned 200${NC}"
else
    echo -e "${RED}✗ Main page returned $HTTP_CODE${NC}"
    exit 1
fi

# Test SPA routing
echo "Testing /members endpoint (SPA routing)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/members)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ SPA routing works (returned 200)${NC}"
else
    echo -e "${RED}✗ SPA routing failed (returned $HTTP_CODE)${NC}"
    exit 1
fi

# Test env.js is accessible
echo "Testing /env.js endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/env.js)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ env.js is accessible${NC}"
else
    echo -e "${RED}✗ env.js returned $HTTP_CODE${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 7: Checking container logs${NC}"
echo "Last 10 lines of logs:"
docker logs --tail 10 $CONTAINER_NAME
echo ""

echo -e "${YELLOW}Step 8: Image size check${NC}"
IMAGE_SIZE=$(docker images $IMAGE_NAME --format "{{.Size}}")
echo "Image size: $IMAGE_SIZE"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All tests passed! ✓${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Container is still running at http://localhost:$TEST_PORT"
echo "You can access it in your browser to test manually."
echo ""
echo "Press Enter to stop the container and cleanup, or Ctrl+C to keep it running."
read -r

# Cleanup will be called by trap
