import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DIVIDER = "━".repeat(40);
const isWindows = process.platform === "win32";
const ext = isWindows ? ".cmd" : "";

/**
 * The 4 setup steps run in order.
 * @type {{ label: string, cmd: string, args: string[] }[]}
 */
export const STEPS = [
  {
    label: "[1/4] Installing root dependencies...",
    cmd: `pnpm${ext}`,
    args: ["install", "--frozen-lockfile"],
  },
  {
    label: "[2/4] Installing web dependencies...",
    cmd: `pnpm${ext}`,
    args: ["install", "--frozen-lockfile", "--filter", "web"],
  },
  {
    label: "[3/4] Generating Prisma client...",
    cmd: `pnpm${ext}`,
    args: ["db:generate"],
  },
  {
    label: "[4/4] Running database migrations...",
    cmd: `npx${ext}`,
    args: ["prisma", "migrate", "deploy"],
  },
];

/**
 * Run ProdHub setup steps in order.
 *
 * Accepts an injectable spawnFn so it can be tested without running real commands.
 *
 * @param {(cmd: string, args: string[], opts?: object) => { status: number | null }} [spawnFn]
 * @returns {{ success: boolean, failedStep: string | null }}
 */
export function runSetup(spawnFn = spawnSync) {
  console.log(`\n${DIVIDER}\n  ProdHub Setup\n${DIVIDER}`);

  for (const step of STEPS) {
    console.log(`\n${step.label}`);
    const result = spawnFn(step.cmd, step.args, { stdio: "inherit" });
    if (result.status !== 0) {
      return { success: false, failedStep: step.label };
    }
  }

  return { success: true, failedStep: null };
}

// Only execute when invoked directly: `node scripts/setup.mjs`
// This guard prevents the script from running when imported for testing.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = runSetup();
  if (!result.success) {
    process.stderr.write(`\n✗ Setup failed at: ${result.failedStep}\n`);
    process.exit(1);
  }
  console.log(`\n✓ Setup complete! Run \`pnpm start:all\` to start ProdHub.\n`);
}
