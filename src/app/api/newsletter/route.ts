import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { withMiddleware, successResponse, validateInput, RateLimitError, ValidationError } from "@/lib/middleware";

const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
});

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

  const existing = await db.newsletter.findUnique({ where: { email } });

  if (existing) {
    throw new ValidationError("Email already subscribed");
  }

  await db.newsletter.create({ data: { email } });

  return successResponse(undefined, "Successfully subscribed to newsletter");
}

export const POST = withMiddleware(handleSubscribe);
