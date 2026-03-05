import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET all gallery images
export async function GET() {
  try {
    const images = await db.galleryImage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}

// POST create a new gallery image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { src, alt, caption, series, width, height, date, blurDataUrl } = body;

    if (!src || !alt || !caption || !series || !date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the max order
    const maxOrderImage = await db.galleryImage.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const order = (maxOrderImage?.order || 0) + 1;

    const image = await db.galleryImage.create({
      data: {
        src,
        alt,
        caption,
        series,
        width: width || 1344,
        height: height || 768,
        date,
        blurDataUrl,
        order,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "create",
        resource: "gallery",
        resourceId: image.id,
        details: JSON.stringify({ alt, series }),
      },
    });

    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gallery image" },
      { status: 500 }
    );
  }
}

// PUT update a gallery image
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Image ID is required" },
        { status: 400 }
      );
    }

    const image = await db.galleryImage.update({
      where: { id },
      data,
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "update",
        resource: "gallery",
        resourceId: image.id,
        details: JSON.stringify({ alt: image.alt, series: image.series }),
      },
    });

    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gallery image" },
      { status: 500 }
    );
  }
}

// DELETE a gallery image or multiple images
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");

    if (ids) {
      // Batch delete
      const idArray = ids.split(",");
      await db.galleryImage.deleteMany({
        where: { id: { in: idArray } },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          action: "delete",
          resource: "gallery",
          details: JSON.stringify({ count: idArray.length, ids: idArray }),
        },
      });

      return NextResponse.json({ success: true, message: `${idArray.length} images deleted` });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Image ID is required" },
        { status: 400 }
      );
    }

    const image = await db.galleryImage.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "delete",
        resource: "gallery",
        resourceId: id,
        details: JSON.stringify({ alt: image.alt }),
      },
    });

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete gallery image" },
      { status: 500 }
    );
  }
}
