import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function handleUpload(request: NextRequest): Promise<NextResponse> {
  await authenticateRequest(request);

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const type = (formData.get("type") as string) || "general";

  if (!file) {
    throw new Error("No file provided");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("File type not allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 10MB limit");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", type);
  await mkdir(uploadDir, { recursive: true });

  const timestamp = Date.now();
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${timestamp}-${originalName}`;
  const filepath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filepath, buffer);

  const publicUrl = `/uploads/${type}/${filename}`;

  return successResponse({
    url: publicUrl,
    filename,
    size: file.size,
    type: file.type,
  });
}

async function handleHealthCheck(): Promise<NextResponse> {
  return successResponse({ message: "Upload endpoint ready" });
}

export const POST = withMiddleware(handleUpload);
export const GET = withMiddleware(handleHealthCheck);
