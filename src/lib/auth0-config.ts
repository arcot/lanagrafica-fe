// Support both runtime (window.ENV) and build-time (import.meta.env) config
// Runtime config takes precedence for K8s deployments
const getEnv = (key: string) => {
  // @ts-expect-error - window.ENV is injected at runtime
  return (window.ENV && window.ENV[key]) || import.meta.env[key] || '';
};

export const auth0Config = {
  domain: getEnv('VITE_AUTH0_DOMAIN'),
  clientId: getEnv('VITE_AUTH0_CLIENT_ID'),
  audience: getEnv('VITE_AUTH0_AUDIENCE'),
  redirectUri: window.location.origin,
};

console.log('[auth0-config.ts] Auth0 configuration:', {
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  audience: auth0Config.audience,
  redirectUri: auth0Config.redirectUri,
});