import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST batch operations (move to series, reorder)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids, data } = body;

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    switch (action) {
      case "moveToSeries": {
        const { series } = data;
        if (!series) {
          return NextResponse.json(
            { success: false, error: "Series is required" },
            { status: 400 }
          );
        }

        await db.galleryImage.updateMany({
          where: { id: { in: ids } },
          data: { series },
        });

        await db.activityLog.create({
          data: {
            action: "update",
            resource: "gallery",
            details: JSON.stringify({ action: "moveToSeries", count: ids.length, series }),
          },
        });

        return NextResponse.json({ success: true, message: `${ids.length} images moved to ${series}` });
      }

      case "reorder": {
        const { orders } = data; // Array of { id, order }
        if (!orders || !Array.isArray(orders)) {
          return NextResponse.json(
            { success: false, error: "Orders array is required" },
            { status: 400 }
          );
        }

        // Update each image's order
        await Promise.all(
          orders.map(({ id, order }: { id: string; order: number }) =>
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
            details: JSON.stringify({ action: "reorder", count: orders.length }),
          },
        });

        return NextResponse.json({ success: true, message: "Order updated" });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in batch operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform batch operation" },
      { status: 500 }
    );
  }
}
