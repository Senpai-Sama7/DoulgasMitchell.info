import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET all journal entries
export async function GET() {
  try {
    const entries = await db.journalEntry.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Transform the data to include tag names
    const transformedEntries = entries.map((entry) => ({
      ...entry,
      tags: entry.tags.map((t) => t.tag.name),
    }));

    return NextResponse.json({ success: true, data: transformedEntries });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

// POST create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, date, content, quote, image, imageAlt, tags } = body;

    if (!title || !date || !content || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the max order
    const maxOrderEntry = await db.journalEntry.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const order = (maxOrderEntry?.order || 0) + 1;

    // Create entry and handle tags
    const entry = await db.journalEntry.create({
      data: {
        title,
        date,
        content,
        quote,
        image,
        imageAlt: imageAlt || title,
        order,
      },
    });

    // Handle tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        let tag = await db.tag.findUnique({
          where: { name: tagName },
        });

        if (!tag) {
          tag = await db.tag.create({
            data: { name: tagName },
          });
        }

        // Create journal-tag relation
        await db.journalTag.create({
          data: {
            journalEntryId: entry.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Log activity
    await db.activityLog.create({
      data: {
        action: "create",
        resource: "journal",
        resourceId: entry.id,
        details: JSON.stringify({ title }),
      },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create journal entry" },
      { status: 500 }
    );
  }
}

// PUT update a journal entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, tags, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Update entry
    const entry = await db.journalEntry.update({
      where: { id },
      data,
    });

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await db.journalTag.deleteMany({
        where: { journalEntryId: id },
      });

      // Add new tags
      for (const tagName of tags) {
        let tag = await db.tag.findUnique({
          where: { name: tagName },
        });

        if (!tag) {
          tag = await db.tag.create({
            data: { name: tagName },
          });
        }

        await db.journalTag.create({
          data: {
            journalEntryId: id,
            tagId: tag.id,
          },
        });
      }
    }

    // Log activity
    await db.activityLog.create({
      data: {
        action: "update",
        resource: "journal",
        resourceId: entry.id,
        details: JSON.stringify({ title: entry.title }),
      },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update journal entry" },
      { status: 500 }
    );
  }
}

// DELETE a journal entry or multiple entries
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");

    if (ids) {
      // Batch delete
      const idArray = ids.split(",");
      
      // Delete journal tags first
      await db.journalTag.deleteMany({
        where: { journalEntryId: { in: idArray } },
      });
      
      await db.journalEntry.deleteMany({
        where: { id: { in: idArray } },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          action: "delete",
          resource: "journal",
          details: JSON.stringify({ count: idArray.length, ids: idArray }),
        },
      });

      return NextResponse.json({ success: true, message: `${idArray.length} entries deleted` });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Delete journal tags first
    await db.journalTag.deleteMany({
      where: { journalEntryId: id },
    });

    const entry = await db.journalEntry.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: "delete",
        resource: "journal",
        resourceId: id,
        details: JSON.stringify({ title: entry.title }),
      },
    });

    return NextResponse.json({ success: true, message: "Entry deleted" });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}
