import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import { withMiddleware, successResponse, validateInput, AuthenticationError, ValidationError } from "@/lib/middleware";
import { batchMoveSchema, reorderSchema } from "@/lib/validations";

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

async function handleBatchOperation(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const body = await request.json();
  const { action, ids, data } = body;

  if (!action || !ids || !Array.isArray(ids)) {
    throw new ValidationError("Invalid request: action and ids are required");
  }

  switch (action) {
    case "moveToSeries": {
      const validatedData = validateInput(batchMoveSchema, { ids, series: data.series });

      await db.galleryImage.updateMany({
        where: { id: { in: validatedData.ids } },
        data: { series: validatedData.series },
      });

      await db.activityLog.create({
        data: {
          action: "update",
          resource: "gallery",
          details: JSON.stringify({ action: "moveToSeries", count: validatedData.ids.length, series: validatedData.series }),
        },
      });

      return successResponse(undefined, `${validatedData.ids.length} images moved to ${validatedData.series}`);
    }

    case "reorder": {
      const validatedData = validateInput(reorderSchema, { items: data.orders });

      await Promise.all(
        validatedData.items.map(({ id, order }) =>
          db.galleryImage.update({
            where: { id },
            data: { order },
          })
        )
      );

      await db.activityLog.create({
        data: {
          action: "update",
          resource: "gallery",
          details: JSON.stringify({ action: "reorder", count: validatedData.items.length }),
        },
      });

      return successResponse(undefined, "Order updated");
    }

    default:
      throw new ValidationError(`Unknown action: ${action}`);
  }
}

export const POST = withMiddleware(handleBatchOperation);
