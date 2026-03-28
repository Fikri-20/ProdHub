import type { NextConfig } from "next";
import { dirname as getDirname } from "path";
import { fileURLToPath } from "url";

// This file lives in web/, so __dirname must point to web/ for turbopack to work
// in CI when we cd into the web directory.
const __dirname = getDirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-pg"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
