import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET settings
export async function GET() {
  try {
    let settings = await db.settings.findFirst();

    // Create default settings if not exists
    if (!settings) {
      settings = await db.settings.create({
        data: {
          siteTitle: "Senpai's Isekai",
          siteDescription: "A personal blog exploring architecture, technology, and creative expression",
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    let settings;

    if (id) {
      settings = await db.settings.update({
        where: { id },
        data,
      });
    } else {
      // Create or update the first settings record
      const existing = await db.settings.findFirst();
      if (existing) {
        settings = await db.settings.update({
          where: { id: existing.id },
          data,
        });
      } else {
        settings = await db.settings.create({
          data,
        });
      }
    }

    // Log activity
    await db.activityLog.create({
      data: {
        action: "update",
        resource: "settings",
        details: JSON.stringify({ fields: Object.keys(data) }),
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
