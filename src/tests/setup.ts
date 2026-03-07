import { afterAll } from "vitest";
import prisma from "../lib/prisma.js";

// Clean up Prisma connection after all tests in each file
afterAll(async () => {
  await prisma.$disconnect();
});
