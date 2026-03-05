import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import { withMiddleware, successResponse } from "@/lib/middleware";

async function authenticateRequest(request: NextRequest): Promise<void> {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = (await cookieStore).get("admin-session")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const sessionResult = await validateSession(token);
  if (!sessionResult.valid) {
    throw new Error("Unauthorized");
  }
}

async function handleGetActivity(request: NextRequest): Promise<NextResponse> {
  await authenticateRequest(request);

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const resource = searchParams.get("resource");

  const where = resource ? { resource } : {};

  const [logs, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    db.activityLog.count({ where }),
  ]);

  return successResponse({
    items: logs,
    total,
    limit,
    offset,
    hasMore: offset + logs.length < total,
  });
}

async function handleDeleteActivity(request: NextRequest): Promise<NextResponse> {
  await authenticateRequest(request);

  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before");

  if (before) {
    await db.activityLog.deleteMany({
      where: { createdAt: { lt: new Date(before) } },
    });
  } else {
    await db.activityLog.deleteMany();
  }

  return successResponse(undefined, "Activity log cleared");
}

export const GET = withMiddleware(handleGetActivity);
export const DELETE = withMiddleware(handleDeleteActivity);
