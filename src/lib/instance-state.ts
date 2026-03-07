/**
 * In-memory instance state for the default (single) user.
 * Set during server startup by seedDefaultUser().
 */
let defaultUserId: string | null = null;

export function getDefaultUserId(): string | null {
  return defaultUserId;
}

export function setDefaultUserId(id: string): void {
  defaultUserId = id;
}
