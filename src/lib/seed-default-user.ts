import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import prisma from "./prisma.js";
import { generateApiKey, hashApiKey } from "./api-key.js";
import { setDefaultUserId } from "./instance-state.js";

const DEFAULT_EMAIL = "admin@localhost";
const DEFAULT_NAME = "Admin";
const SHARED_CONFIG_DIR = path.join(homedir(), ".prodhub");
const SHARED_CONFIG_PATH = path.join(SHARED_CONFIG_DIR, "agent.json");

/**
 * On server start:
 * 1. Upsert the default user (admin@localhost)
 * 2. Ensure an active API key exists — create one if not
 * 3. Write ~/.prodhub/agent.json so agents can auto-connect
 * 4. Set the default user ID in instance state
 */
export async function seedDefaultUser(): Promise<void> {
  // Upsert default user
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_EMAIL },
    update: {},
    create: { email: DEFAULT_EMAIL, name: DEFAULT_NAME },
  });

  setDefaultUserId(user.id);

  // Check for existing active API key
  const existingKey = await prisma.apiKey.findFirst({
    where: { userId: user.id, revokedAt: null },
  });

  let rawKey: string;

  if (existingKey) {
    // We can't recover the raw key from the hash, so check if agent.json already exists
    // with a key that matches. If not, generate a new one.
    if (existsSync(SHARED_CONFIG_PATH)) {
      try {
        const existing = JSON.parse(
          (await import("node:fs")).readFileSync(SHARED_CONFIG_PATH, "utf8"),
        ) as { apiKey?: string };

        if (existing.apiKey) {
          const hash = hashApiKey(existing.apiKey);
          const valid = await prisma.apiKey.findFirst({
            where: { key: hash, userId: user.id, revokedAt: null },
          });

          if (valid) {
            console.log(`Default user: ${user.email} (${user.id})`);
            console.log(`Agent config: ${SHARED_CONFIG_PATH}`);
            return;
          }
        }
      } catch {
        // Config file is corrupt or unreadable — regenerate
      }
    }

    // Existing key in DB but no valid agent.json — generate a fresh key
    const fresh = generateApiKey();
    rawKey = fresh.rawKey;

    await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: "auto-generated",
        key: fresh.hash,
        prefix: fresh.prefix,
      },
    });
  } else {
    // No API key at all — generate one
    const fresh = generateApiKey();
    rawKey = fresh.rawKey;

    await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: "auto-generated",
        key: fresh.hash,
        prefix: fresh.prefix,
      },
    });
  }

  // Write shared config for agents
  const port = Number(process.env.PORT) || 3000;
  const agentConfig = {
    apiKey: rawKey,
    apiUrl: `http://localhost:${port}`,
  };

  try {
    if (!existsSync(SHARED_CONFIG_DIR)) {
      mkdirSync(SHARED_CONFIG_DIR, { recursive: true });
    }
    writeFileSync(SHARED_CONFIG_PATH, JSON.stringify(agentConfig, null, 2));
  } catch (err) {
    console.warn("Could not write agent config:", err);
  }

  console.log(`Default user: ${user.email} (${user.id})`);
  console.log(`API key written to: ${SHARED_CONFIG_PATH}`);
}
