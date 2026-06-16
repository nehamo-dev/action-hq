import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  // PrismaBetterSqlite3 accepts { url: "file:..." }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaBetterSqlite3({ url: dbUrl } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
