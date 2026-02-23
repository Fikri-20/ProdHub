import { afterAll } from "vitest";
import prisma from "../lib/prisma.js";

// Clean up Prisma connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
