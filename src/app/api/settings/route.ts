import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import { withMiddleware, successResponse, validateInput, AuthenticationError } from "@/lib/middleware";
import { settingsSchema } from "@/lib/validations";

const SETTINGS_SINGLETON_ID = "settings-singleton";
const DEFAULT_SETTINGS = {
  siteTitle: "Douglas Mitchell",
  siteDescription: "A personal portfolio exploring architecture, technology, and creative expression",
};

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

async function handleGetSettings(request: NextRequest): Promise<NextResponse> {
  const singleton = await db.settings.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
  });

  if (singleton) {
    return successResponse(singleton);
  }

  const latestLegacy = await db.settings.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const settings = await db.settings.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: SETTINGS_SINGLETON_ID,
      siteTitle: latestLegacy?.siteTitle ?? DEFAULT_SETTINGS.siteTitle,
      siteDescription: latestLegacy?.siteDescription ?? DEFAULT_SETTINGS.siteDescription,
      linkedin: latestLegacy?.linkedin ?? undefined,
      github: latestLegacy?.github ?? undefined,
      telegram: latestLegacy?.telegram ?? undefined,
      whatsapp: latestLegacy?.whatsapp ?? undefined,
    },
  });

  return successResponse(settings);
}

async function handleUpdateSettings(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const body = await request.json();
  const data = validateInput(settingsSchema, body);

  const settings = await db.settings.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: data,
    create: {
      id: SETTINGS_SINGLETON_ID,
      ...data,
    },
  });

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
