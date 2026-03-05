import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { withMiddleware, successResponse, RateLimitError } from "@/lib/middleware";
import { contactFormSchema } from "@/lib/validations";

async function handleContact(request: NextRequest): Promise<NextResponse> {
  const ipAddress = getClientIp(request);
  const rateLimitResult = checkRateLimit(`contact:${ipAddress}`);
  
  if (!rateLimitResult.allowed) {
    throw new RateLimitError(
      Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)
    );
  }

  const body = await request.json();
  const data = validateInput(contactFormSchema, body);

  await db.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    },
  });

  return successResponse(undefined, "Message sent successfully");
}

export const POST = withMiddleware(handleContact);
