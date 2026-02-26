import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import zlib from "node:zlib";

const projectRoot = process.cwd();
const desktopBuildPath = resolve(projectRoot, "dist", "desktop", "main.cjs");
const stagingDir = resolve(projectRoot, "dist", "desktop-installer");
const stagingMainPath = resolve(stagingDir, "main.js");
const stagingPackagePath = resolve(stagingDir, "package.json");
const stagingIconPath = resolve(stagingDir, "icon.png");
const rootPackagePath = resolve(projectRoot, "package.json");

if (!existsSync(desktopBuildPath)) {
  throw new Error(
    `Desktop build output not found at ${desktopBuildPath}. Run build:desktop first.`,
  );
}

const rootPackage = JSON.parse(readFileSync(rootPackagePath, "utf8"));
const getWindowsVersion = rootPackage.dependencies?.["get-windows"];

if (!getWindowsVersion) {
  throw new Error("Missing get-windows dependency in root package.json");
}

rmSync(stagingDir, { recursive: true, force: true });
mkdirSync(stagingDir, { recursive: true });

cpSync(desktopBuildPath, stagingMainPath);

// --- Generate a simple 16x16 PNG tray icon ---
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const tp = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([tp, data])));
  return Buffer.concat([len, tp, data, crc]);
}

function generateIconPng(size) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA

  // Pixel data: a rounded blue-purple gradient square
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const center = (size - 1) / 2;
  const radius = size / 2 - 0.5;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const i = rowStart + 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius - 1) {
        // Inner: bright white-green (visible on dark tray backgrounds)
        const t = (x + y) / (size * 2);
        raw[i] = Math.round(100 + t * 155); // R: bright
        raw[i + 1] = Math.round(220 + t * 35); // G: dominant
        raw[i + 2] = Math.round(140 + t * 115); // B: bright
        raw[i + 3] = 255;
      } else if (dist <= radius) {
        // Edge: anti-aliased
        const alpha = Math.max(0, Math.min(1, radius - dist));
        raw[i] = 200;
        raw[i + 1] = 240;
        raw[i + 2] = 200;
        raw[i + 3] = Math.round(alpha * 255);
      } else {
        // Outside: transparent
        raw[i + 3] = 0;
      }
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// Generate and write icon
const iconPng = generateIconPng(256);
writeFileSync(stagingIconPath, iconPng);
console.log("[prepare] Generated tray icon at", stagingIconPath);

// --- Write staging package.json ---
const installerPackage = {
  name: "prodhub-agent",
  version: rootPackage.version,
  author: rootPackage.author || "ProdHub",
  productName: "ProdHub Agent",
  description: "ProdHub desktop activity tracking agent",
  main: "main.js",
  dependencies: {
    "get-windows": getWindowsVersion,
  },
};

writeFileSync(stagingPackagePath, JSON.stringify(installerPackage, null, 2));

execSync("npm install --omit=dev --no-package-lock", {
  cwd: stagingDir,
  stdio: "inherit",
});

// --- Bake config.json from .env into staging ---
const envPath = resolve(projectRoot, ".env");
const stagingConfigPath = resolve(stagingDir, "config.json");

const bakedConfig = {
  apiUrl: "http://localhost:3000",
  apiKey: "",
  dashboardUrl: "http://localhost:3001/dashboard",
  pollIntervalMs: 5000,
  autoStartEnabled: true,
};

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();

    if (key === "TRACKER_API_URL") bakedConfig.apiUrl = value;
    if (key === "TRACKER_API_KEY") bakedConfig.apiKey = value;
    if (key === "TRACKER_DASHBOARD_URL") bakedConfig.dashboardUrl = value;
    if (key === "TRACKER_POLL_INTERVAL_MS") {
      const parsed = parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) bakedConfig.pollIntervalMs = parsed;
    }
    if (key === "TRACKER_AUTO_START") bakedConfig.autoStartEnabled = value === "true" || value === "1";
  }
}

writeFileSync(stagingConfigPath, JSON.stringify(bakedConfig, null, 2));
console.log("[prepare] Baked config.json at", stagingConfigPath);
if (bakedConfig.apiKey) {
  console.log("[prepare] API key present:", bakedConfig.apiKey.slice(0, 6) + "...");
} else {
  console.warn("[prepare] WARNING: No API key found in .env — packaged app will lack authentication");
}
