import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import { withMiddleware, successResponse, validateInput, AuthenticationError } from "@/lib/middleware";
import { activityDeleteSchema, activityQuerySchema } from "@/lib/validations";

async function authenticateRequest(request: NextRequest): Promise<void> {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = (await cookieStore).get("admin-session")?.value;

  if (!token) {
    throw new AuthenticationError();
  }

  const sessionResult = await validateSession(token);
  if (!sessionResult.valid) {
    throw new AuthenticationError();
  }
}

async function handleGetActivity(request: NextRequest): Promise<NextResponse> {
  await authenticateRequest(request);

  const { searchParams } = new URL(request.url);
  const query = validateInput(activityQuerySchema, {
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
    resource: searchParams.get("resource") ?? undefined,
  });

  const where = query.resource ? { resource: query.resource } : {};

  const [logs, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: query.offset,
    }),
    db.activityLog.count({ where }),
  ]);

  return successResponse({
    items: logs,
    total,
    limit: query.limit,
    offset: query.offset,
    hasMore: query.offset + logs.length < total,
  });
}

async function handleDeleteActivity(request: NextRequest): Promise<NextResponse> {
  await authenticateRequest(request);

  const { searchParams } = new URL(request.url);
  const query = validateInput(activityDeleteSchema, {
    before: searchParams.get("before") ?? undefined,
  });

  if (query.before) {
    await db.activityLog.deleteMany({
      where: { createdAt: { lt: new Date(query.before) } },
    });
  } else {
    await db.activityLog.deleteMany();
  }

  return successResponse(undefined, "Activity log cleared");
}

export const GET = withMiddleware(handleGetActivity);
export const DELETE = withMiddleware(handleDeleteActivity);
