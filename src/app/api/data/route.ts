import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET export all data
export async function GET() {
  try {
    const [galleryImages, journalEntries, settings] = await Promise.all([
      db.galleryImage.findMany({
        orderBy: { order: "asc" },
      }),
      db.journalEntry.findMany({
        orderBy: { order: "asc" },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      db.settings.findFirst(),
    ]);

    // Transform journal entries
    const transformedEntries = journalEntries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      date: entry.date,
      content: entry.content,
      quote: entry.quote,
      image: entry.image,
      imageAlt: entry.imageAlt,
      order: entry.order,
      tags: entry.tags.map((t) => t.tag.name),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: {
        galleryImages,
        journalEntries: transformedEntries,
        settings: settings || {
          siteTitle: "Senpai's Isekai",
          siteDescription: "A personal blog exploring architecture, technology, and creative expression",
        },
      },
    };

    // Log activity
    await db.activityLog.create({
      data: {
        action: "export",
        resource: "data",
        details: JSON.stringify({
          galleryCount: galleryImages.length,
          journalCount: journalEntries.length,
        }),
      },
    });

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export data" },
      { status: 500 }
    );
  }
}

// POST import data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, mode = "merge" } = body; // mode: 'merge' | 'replace'

    if (!data) {
      return NextResponse.json(
        { success: false, error: "No data provided" },
        { status: 400 }
      );
    }

    const results = {
      gallery: { created: 0, updated: 0 },
      journal: { created: 0, updated: 0 },
      settings: false,
    };

    // If mode is replace, delete all existing data
    if (mode === "replace") {
      await db.journalTag.deleteMany();
      await db.journalEntry.deleteMany();
      await db.galleryImage.deleteMany();
      await db.settings.deleteMany();
    }

    // Import gallery images
    if (data.galleryImages && Array.isArray(data.galleryImages)) {
      for (const image of data.galleryImages) {
        if (mode === "merge") {
          const existing = await db.galleryImage.findUnique({
            where: { id: image.id },
          });

          if (existing) {
            await db.galleryImage.update({
              where: { id: image.id },
              data: image,
            });
            results.gallery.updated++;
          } else {
            await db.galleryImage.create({
              data: {
                ...image,
                id: undefined, // Let Prisma generate a new ID
              },
            });
            results.gallery.created++;
          }
        } else {
          await db.galleryImage.create({ data: image });
          results.gallery.created++;
        }
      }
    }

    // Import journal entries
    if (data.journalEntries && Array.isArray(data.journalEntries)) {
      for (const entry of data.journalEntries) {
        const { tags, ...entryData } = entry;

        let newEntry;

        if (mode === "merge") {
          const existing = await db.journalEntry.findUnique({
            where: { id: entry.id },
          });

          if (existing) {
            newEntry = await db.journalEntry.update({
              where: { id: entry.id },
              data: entryData,
            });
            results.journal.updated++;
          } else {
            newEntry = await db.journalEntry.create({
              data: {
                ...entryData,
                id: undefined,
              },
            });
            results.journal.created++;
          }
        } else {
          newEntry = await db.journalEntry.create({
            data: {
              ...entryData,
              id: undefined,
            },
          });
          results.journal.created++;
        }

        // Handle tags
        if (tags && Array.isArray(tags)) {
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
                journalEntryId: newEntry.id,
                tagId: tag.id,
              },
            });
          }
        }
      }
    }

    // Import settings
    if (data.settings) {
      const existing = await db.settings.findFirst();

      if (existing) {
        await db.settings.update({
          where: { id: existing.id },
          data: data.settings,
        });
      } else {
        await db.settings.create({ data: data.settings });
      }

      results.settings = true;
    }

    // Log activity
    await db.activityLog.create({
      data: {
        action: "import",
        resource: "data",
        details: JSON.stringify({ mode, results }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data imported successfully",
      results,
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import data" },
      { status: 500 }
    );
  }
}
