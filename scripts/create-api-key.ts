import prisma from "../src/lib/prisma.js";
import { generateApiKey } from "../src/lib/api-key.js";

// Look up Ahmed Fikri's account by email
const user = await prisma.user.findFirst({
  where: { email: "dev.fikrii@gmail.com" },
});

if (!user) {
  console.error("User not found. Make sure you're logged in via the dashboard first.");
  process.exit(1);
}

const userId = user.id;

// Generate an API key
const { rawKey, hash, prefix } = generateApiKey();
await prisma.apiKey.create({
  data: {
    userId,
    name: "Desktop Agent",
    key: hash,
    prefix,
  },
});

console.log("\n=== API Key for Ahmed Fikri ===");
console.log(rawKey);
console.log("==============================\n");

await prisma.$disconnect();
