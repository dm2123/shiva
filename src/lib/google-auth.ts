import { createPublicKey, verify as cryptoVerify, type KeyObject } from 'crypto';

/**
 * Google ID token verification (server-side).
 *
 * Verifies a Google-issued ID token (JWT) end-to-end:
 *  - RS256 signature against Google's public keys (JWKS, cached in memory)
 *  - issuer is accounts.google.com
 *  - audience matches one of OUR OAuth client IDs (env)
 *  - token is not expired
 *  - email is verified by Google
 *
 * Configure with env:
 *  - GOOGLE_CLIENT_ID          (Web OAuth client ID — required)
 *  - GOOGLE_ANDROID_CLIENT_ID  (Android OAuth client ID — optional, accepted too)
 *
 * No external dependency: uses Node's built-in crypto + Google's JWKS endpoint.
 */

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const VALID_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

export interface GoogleIdTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

interface Jwk {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
  n: string;
  e: string;
}

// ── JWKS cache ──────────────────────────────────────────────────────────────
let jwksCache: { keys: Jwk[]; expiresAt: number } | null = null;

async function fetchGoogleKeys(forceRefresh = false): Promise<Jwk[]> {
  const now = Date.now();
  if (!forceRefresh && jwksCache && jwksCache.expiresAt > now) {
    return jwksCache.keys;
  }

  const res = await fetch(GOOGLE_JWKS_URL);
  if (!res.ok) {
    throw new Error('Google ke public keys fetch nahi ho paye');
  }
  const data: any = await res.json();
  const keys: Jwk[] = Array.isArray(data?.keys) ? data.keys : [];

  // Respect Google's cache header roughly; default to 1 hour.
  let ttlMs = 60 * 60 * 1000;
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  if (maxAgeMatch) ttlMs = parseInt(maxAgeMatch[1], 10) * 1000;

  jwksCache = { keys, expiresAt: now + ttlMs };
  return keys;
}

async function getKeyForKid(kid: string): Promise<KeyObject> {
  let keys = await fetchGoogleKeys();
  let jwk = keys.find((k) => k.kid === kid);
  if (!jwk) {
    // Key rotation race — refresh once and retry.
    keys = await fetchGoogleKeys(true);
    jwk = keys.find((k) => k.kid === kid);
  }
  if (!jwk) {
    throw new Error('Google token ki signing key nahi mili');
  }
  return createPublicKey({ key: jwk as any, format: 'jwk' });
}

// ── Audience config ─────────────────────────────────────────────────────────
export function getGoogleClientIds(): string[] {
  const ids = [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID]
    .flatMap((v) => (v ? v.split(',') : []))
    .map((v) => v.trim())
    .filter(Boolean);
  return ids;
}

// ── Main verifier ───────────────────────────────────────────────────────────
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdTokenPayload> {
  const audiences = getGoogleClientIds();
  if (audiences.length === 0) {
    throw new Error('Google sign-in server par configured nahi hai (GOOGLE_CLIENT_ID missing)');
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid Google token format');
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  let header: any;
  let payload: any;
  try {
    header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf-8'));
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
  } catch {
    throw new Error('Invalid Google token encoding');
  }

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Invalid Google token header');
  }

  // 1) Signature
  const key = await getKeyForKid(header.kid);
  const signingInput = Buffer.from(`${encodedHeader}.${encodedPayload}`);
  const signature = Buffer.from(encodedSignature, 'base64url');
  const signatureValid = cryptoVerify('RSA-SHA256', signingInput, key, signature);
  if (!signatureValid) {
    throw new Error('Google token signature invalid hai');
  }

  // 2) Issuer
  if (!VALID_ISSUERS.includes(payload.iss)) {
    throw new Error('Google token issuer invalid hai');
  }

  // 3) Audience — token hamare hi client ke liye bana hona chahiye
  if (!audiences.includes(payload.aud)) {
    throw new Error('Google token audience mismatch (galat client ID)');
  }

  // 4) Expiry
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new Error('Google token expire ho gaya hai');
  }

  // 5) Email verified
  if (!payload.email || payload.email_verified !== true) {
    throw new Error('Google account ka email verified nahi hai');
  }

  return payload as GoogleIdTokenPayload;
}
