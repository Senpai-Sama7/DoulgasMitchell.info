#!/usr/bin/env node
/**
 * Pre-build Prisma generator.
 * Detects the database provider from DATABASE_URL and generates the
 * correct Prisma Client so static generation doesn't explode with a
 * provider/url mismatch.
 */
import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL || "";

const isPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://");
const isSqlite = url.startsWith("file:") || url.startsWith("sqlite:") || url.endsWith(".db");

if (isPostgres) {
  console.log("[build-generate] Detected PostgreSQL database URL. Generating from schema.prisma...");
  execSync("prisma generate --schema=prisma/schema.prisma", { stdio: "inherit" });
} else if (isSqlite) {
  console.log("[build-generate] Detected SQLite database URL. Generating from schema.sqlite.prisma...");
  execSync("prisma generate --schema=prisma/schema.sqlite.prisma", { stdio: "inherit" });
} else {
  console.warn("[build-generate] Could not detect database provider from DATABASE_URL. Falling back to schema.prisma...");
  execSync("prisma generate --schema=prisma/schema.prisma", { stdio: "inherit" });
}
