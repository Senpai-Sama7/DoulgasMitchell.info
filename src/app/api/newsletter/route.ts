import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { withMiddleware, successResponse, validateInput, RateLimitError, ValidationError } from "@/lib/middleware";

const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
});

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return "code" in error && (error as { code?: string }).code === "P2002";
}

async function handleSubscribe(request: NextRequest): Promise<NextResponse> {
  const ipAddress = getClientIp(request);
  const rateLimitResult = checkRateLimit(`newsletter:${ipAddress}`);
  
  if (!rateLimitResult.allowed) {
    throw new RateLimitError(
      Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)
    );
  }

  const body = await request.json();
  const { email } = validateInput(newsletterSchema, body);

  try {
    await db.newsletter.create({ data: { email } });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ValidationError("Email already subscribed");
    }
    throw error;
  }

  return successResponse(undefined, "Successfully subscribed to newsletter");
}

export const POST = withMiddleware(handleSubscribe);
