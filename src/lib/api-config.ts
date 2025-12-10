// Support both runtime (window.ENV) and build-time (import.meta.env) config
// Runtime config takes precedence for K8s deployments
const getEnv = (key: string) => {
  // @ts-ignore - window.ENV is injected at runtime
  return (window.ENV && window.ENV[key]) || import.meta.env[key] || '';
};

export const apiConfig = {
  baseUrl: getEnv('VITE_API_BASE_URL'),
  gatewayPort: getEnv('VITE_API_GATEWAY_PORT') || '8765',
  version: getEnv('VITE_API_VERSION') || '/api/v1',
  get fullUrl() {
    // In development, use the Vite proxy
    if (import.meta.env.DEV) {
      return this.version; // Just '/api/v1' - Vite proxy will handle the rest
    }
    // In production, use the full external URL
    return `${this.baseUrl}:${this.gatewayPort}${this.version}`;
  }
};

console.log('[api-config.ts] API configuration:', {
  baseUrl: apiConfig.baseUrl,
  gatewayPort: apiConfig.gatewayPort,
  version: apiConfig.version,
  fullUrl: apiConfig.fullUrl,
});