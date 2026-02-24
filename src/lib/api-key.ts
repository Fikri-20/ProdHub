import { randomBytes, createHash } from "node:crypto";

/**
 * Generate a new API key pair.
 * Returns the raw key (shown once) and its SHA-256 hash (stored in DB).
 */
export function generateApiKey(): {
  rawKey: string;
  hash: string;
  prefix: string;
} {
  const rawKey = `pk_${randomBytes(32).toString("hex")}`;
  const hash = hashApiKey(rawKey);
  const prefix = rawKey.slice(0, 11); // "pk_" + 8 hex chars
  return { rawKey, hash, prefix };
}

/**
 * Hash a raw API key using SHA-256.
 * Used for both storage and lookup.
 */
export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}
