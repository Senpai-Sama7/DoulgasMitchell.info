import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET activity log with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const resource = searchParams.get("resource");

    const where = resource ? { resource } : {};

    const logs = await db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await db.activityLog.count({ where });

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}

// DELETE activity log (clear all or by date range)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const before = searchParams.get("before");

    if (before) {
      await db.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: new Date(before),
          },
        },
      });
    } else {
      await db.activityLog.deleteMany();
    }

    return NextResponse.json({ success: true, message: "Activity log cleared" });
  } catch (error) {
    console.error("Error clearing activity log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear activity log" },
      { status: 500 }
    );
  }
}
