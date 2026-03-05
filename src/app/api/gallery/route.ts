import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import {
  withMiddleware,
  errorResponse,
  successResponse,
  validateInput,
  NotFoundError,
} from "@/lib/middleware";
import {
  createGalleryImageSchema,
  updateGalleryImageSchema,
  galleryFilterSchema,
} from "@/lib/validations";

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

async function handleGetGallery(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  
  const filterInput = {
    series: searchParams.get("series"),
    search: searchParams.get("search") || undefined,
    sortBy: searchParams.get("sortBy") || "date",
    sortOrder: searchParams.get("sortOrder") || "desc",
    limit: parseInt(searchParams.get("limit") || "20", 10),
    offset: parseInt(searchParams.get("offset") || "0", 10),
  };

  const filter = validateInput(galleryFilterSchema, filterInput);

  const where: Record<string, unknown> = {};
  
  if (filter.series) {
    where.series = filter.series;
  }
  
  if (filter.search) {
    where.OR = [
      { alt: { contains: filter.search, mode: "insensitive" } },
      { caption: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const [images, total] = await Promise.all([
    db.galleryImage.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: filter.limit,
      skip: filter.offset,
    }),
    db.galleryImage.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      items: images,
      total,
      limit: filter.limit,
      offset: filter.offset,
      hasMore: offset + images.length < total,
    },
  });
}

async function handleCreateGallery(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const body = await request.json();
  const data = validateInput(createGalleryImageSchema, body);

  const maxOrderImage = await db.galleryImage.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (maxOrderImage?.order || 0) + 1;

  const image = await db.galleryImage.create({
    data: {
      src: data.src,
      alt: data.alt,
      caption: data.caption,
      series: data.series,
      width: data.width,
      height: data.height,
      date: data.date,
      blurDataUrl: data.blurDataUrl,
      order,
    },
  });

  await db.activityLog.create({
    data: {
      action: "create",
      resource: "gallery",
      resourceId: image.id,
      details: JSON.stringify({ alt: data.alt, series: data.series }),
    },
  });

  return successResponse(image, "Image created successfully");
}

async function handleUpdateGallery(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const body = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    throw new Error("Image ID is required");
  }

  const data = validateInput(updateGalleryImageSchema, updateData);

  const image = await db.galleryImage.update({
    where: { id },
    data,
  });

  await db.activityLog.create({
    data: {
      action: "update",
      resource: "gallery",
      resourceId: image.id,
      details: JSON.stringify({ alt: image.alt, series: image.series }),
    },
  });

  return successResponse(image, "Image updated successfully");
}

async function handleDeleteGallery(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const ids = searchParams.get("ids");

  if (ids) {
    const idArray = ids.split(",");
    await db.galleryImage.deleteMany({
      where: { id: { in: idArray } },
    });

    await db.activityLog.create({
      data: {
        action: "delete",
        resource: "gallery",
        details: JSON.stringify({ count: idArray.length, ids: idArray }),
      },
    });

    return successResponse(undefined, `${idArray.length} images deleted`);
  }

  if (!id) {
    throw new Error("Image ID is required");
  }

  await db.galleryImage.delete({
    where: { id },
  });

  await db.activityLog.create({
    data: {
      action: "delete",
      resource: "gallery",
      resourceId: id,
    },
  });

  return successResponse(undefined, "Image deleted successfully");
}

export const GET = withMiddleware(handleGetGallery);
export const POST = withMiddleware(handleCreateGallery);
export const PUT = withMiddleware(handleUpdateGallery);
export const DELETE = withMiddleware(handleDeleteGallery);
