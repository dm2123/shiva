/**
 * Shared secret for the internal session-check route
 * (app/api/internal/session-check), which middleware uses to validate
 * sessions from the Edge Runtime.
 *
 * This module is deliberately PURE (no imports, no Node-only APIs) so it can
 * be imported from both the Edge Runtime (lib/auth-edge.ts) and the Node
 * runtime (the route handler) — both sides read the same env vars, so they
 * always agree on the secret without any configuration.
 *
 * Secret resolution order:
 *   1. INTERNAL_API_SECRET env var (preferred, set this in production)
 *   2. SESSION_SECRET env var (already declared in lib/env.ts / .env.example)
 *   3. A built-in fallback constant.
 *
 * The fallback keeps the login fix working with zero deploy-time config, but
 * it is visible in the source tree, so it only stops casual unauthenticated
 * probing — it is NOT a real secret. Set INTERNAL_API_SECRET (or
 * SESSION_SECRET) in the production container env to make this check real.
 */
export const INTERNAL_SECRET_HEADER = 'x-internal-secret';

const FALLBACK_INTERNAL_SECRET = 'shiva-internal-fallback-set-INTERNAL_API_SECRET-in-prod';

export function getInternalSecret(): string {
  return (
    process.env.INTERNAL_API_SECRET ||
    process.env.SESSION_SECRET ||
    FALLBACK_INTERNAL_SECRET
  );
}
