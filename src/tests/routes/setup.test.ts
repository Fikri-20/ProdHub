import { describe, it, expect, beforeEach, afterAll } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import { rmSync, existsSync } from "node:fs";
import prisma from "../../lib/prisma.js";
import { seedDefaultUser } from "../../lib/seed-default-user.js";

// ---------------------------------------------------------------------------
// scripts/setup.mjs — runSetup unit tests
// ---------------------------------------------------------------------------

// Dynamic import: avoids TypeScript declaration issues for the .mjs script.
// The script guards against auto-execution with `process.argv[1]` check.
const __dir = fileURLToPath(new URL(".", import.meta.url));
const setupPath = path.resolve(__dir, "../../../scripts/setup.mjs");
type SpawnFn = (
  cmd: string,
  args: string[],
  opts?: object,
) => { status: number | null };
type SetupResult = { success: boolean; failedStep: string | null };
type SetupModule = {
  runSetup: (spawnFn?: SpawnFn) => SetupResult;
  STEPS: { label: string; cmd: string; args: string[] }[];
};

const { runSetup, STEPS } = (await import(setupPath)) as SetupModule;

describe("scripts/setup.mjs — runSetup", () => {
  it("runs exactly 4 steps", () => {
    const calls: { cmd: string; args: string[] }[] = [];
    const mockSpawn: SpawnFn = (cmd, args) => {
      calls.push({ cmd, args });
      return { status: 0 };
    };

    runSetup(mockSpawn);
    expect(calls).toHaveLength(4);
  });

  it("returns { success: true, failedStep: null } when all steps exit 0", () => {
    const mockSpawn: SpawnFn = () => ({ status: 0 });
    expect(runSetup(mockSpawn)).toEqual({ success: true, failedStep: null });
  });

  it("returns { success: false } with the failing step label on non-zero exit", () => {
    let callCount = 0;
    const mockSpawn: SpawnFn = () => ({ status: ++callCount === 2 ? 1 : 0 });

    const result = runSetup(mockSpawn);
    expect(result.success).toBe(false);
    expect(result.failedStep).toBe(STEPS[1]?.label);
  });

  it("stops executing after the first failing step", () => {
    let callCount = 0;
    const mockSpawn: SpawnFn = () => ({ status: ++callCount === 1 ? 1 : 0 });

    runSetup(mockSpawn);
    expect(callCount).toBe(1);
  });

  it("STEPS[0] installs root dependencies with --frozen-lockfile", () => {
    expect(STEPS[0]?.args).toContain("install");
    expect(STEPS[0]?.args).toContain("--frozen-lockfile");
    expect(STEPS[0]?.args).not.toContain("--filter");
  });

  it("STEPS[1] installs web dependencies with --filter web", () => {
    expect(STEPS[1]?.args).toContain("install");
    expect(STEPS[1]?.args).toContain("--filter");
    expect(STEPS[1]?.args).toContain("web");
  });

  it("STEPS[2] runs pnpm db:generate to generate the Prisma client", () => {
    expect(STEPS[2]?.args).toContain("db:generate");
  });

  it("STEPS[3] runs prisma migrate deploy (non-interactive)", () => {
    expect(STEPS[3]?.args).toContain("migrate");
    expect(STEPS[3]?.args).toContain("deploy");
  });

  it("all STEPS use explicit args arrays (cross-platform safe)", () => {
    for (const step of STEPS) {
      expect(Array.isArray(step.args)).toBe(true);
      expect(step.cmd).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// seedDefaultUser — return value tests
// ---------------------------------------------------------------------------

const TEST_CONFIG_DIR = path.join(
  os.tmpdir(),
  `prodhub-test-${process.pid}-${Date.now()}`,
);

beforeEach(async () => {
  // Redirect agent.json to a temp directory so tests don't touch ~/.prodhub
  process.env["PRODHUB_CONFIG_DIR"] = TEST_CONFIG_DIR;

  // Remove stale temp config from any previous run
  if (existsSync(TEST_CONFIG_DIR)) {
    rmSync(TEST_CONFIG_DIR, { recursive: true });
  }

  // Remove the default user + API keys so each test starts from a clean state
  await prisma.apiKey.deleteMany({
    where: { user: { email: "admin@localhost" } },
  });
  await prisma.user.deleteMany({ where: { email: "admin@localhost" } });
});

afterAll(() => {
  delete process.env["PRODHUB_CONFIG_DIR"];
  if (existsSync(TEST_CONFIG_DIR)) {
    rmSync(TEST_CONFIG_DIR, { recursive: true });
  }
});

describe("seedDefaultUser return value", () => {
  it("returns a non-null string rawKey on first run (no existing user/key)", async () => {
    const result = await seedDefaultUser();
    expect(result.rawKey).not.toBeNull();
    expect(typeof result.rawKey).toBe("string");
  });

  it("rawKey starts with the pk_ prefix on first run", async () => {
    const result = await seedDefaultUser();
    expect(result.rawKey).toMatch(/^pk_/);
  });

  it("returns rawKey=null on subsequent run (existing key + valid agent.json)", async () => {
    // First run creates the key and writes agent.json
    await seedDefaultUser();

    // Second run: finds existing DB key and valid agent.json → returns null
    const result = await seedDefaultUser();
    expect(result.rawKey).toBeNull();
  });

  it("returns a new rawKey when agent.json is missing (DB key exists but no config)", async () => {
    // First run: creates key and writes agent.json
    await seedDefaultUser();

    // Remove agent.json to simulate missing config file
    rmSync(TEST_CONFIG_DIR, { recursive: true });

    // Second run: DB key exists but agent.json is gone → generates a new key
    const result = await seedDefaultUser();
    expect(result.rawKey).not.toBeNull();
  });
});
