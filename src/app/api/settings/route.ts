import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import { withMiddleware, successResponse, validateInput } from "@/lib/middleware";
import { settingsSchema } from "@/lib/validations";

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

async function handleGetSettings(request: NextRequest): Promise<NextResponse> {
  let settings = await db.settings.findFirst();

  if (!settings) {
    settings = await db.settings.create({
      data: {
        siteTitle: "Senpai's Isekai",
        siteDescription: "A personal blog exploring architecture, technology, and creative expression",
      },
    });
  }

  return successResponse(settings);
}

async function handleUpdateSettings(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const body = await request.json();
  const data = validateInput(settingsSchema, body);

  let settings;

  const existing = await db.settings.findFirst();
  if (existing) {
    settings = await db.settings.update({
      where: { id: existing.id },
      data,
    });
  } else {
    settings = await db.settings.create({ data });
  }

  await db.activityLog.create({
    data: {
      action: "update",
      resource: "settings",
      details: JSON.stringify({ fields: Object.keys(data) }),
    },
  });

  return successResponse(settings, "Settings updated successfully");
}

export const GET = withMiddleware(handleGetSettings);
export const PUT = withMiddleware(handleUpdateSettings);
