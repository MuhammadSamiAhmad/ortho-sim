import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global “prisma” to persist across hot reloads in dev
  //       (prevent creating new clients thousands of times)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // optional: logs all SQL queries in console
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
