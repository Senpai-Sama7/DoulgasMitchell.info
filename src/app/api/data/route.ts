import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import { withMiddleware, successResponse, validateInput } from "@/lib/middleware";
import { importDataSchema } from "@/lib/validations";

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

async function handleExport(request: NextRequest): Promise<NextResponse> {
  await authenticateRequest(request);

  const [galleryImages, journalEntries, settings] = await Promise.all([
    db.galleryImage.findMany({ orderBy: { order: "asc" } }),
    db.journalEntry.findMany({
      orderBy: { order: "asc" },
      include: { tags: { include: { tag: true } } },
    }),
    db.settings.findFirst(),
  ]);

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

  return successResponse(exportData);
}

async function handleImport(request: NextRequest): Promise<NextResponse> {
  await authenticateRequest(request);

  const body = await request.json();
  const { data, mode = "merge" } = validateInput(importDataSchema, { ...body, mode: body.mode || "merge" });

  if (!data) {
    throw new Error("No data provided");
  }

  const results = {
    gallery: { created: 0, updated: 0 },
    journal: { created: 0, updated: 0 },
    settings: false,
  };

  if (mode === "replace") {
    await db.journalTag.deleteMany();
    await db.journalEntry.deleteMany();
    await db.galleryImage.deleteMany();
    await db.settings.deleteMany();
  }

  if (data.gallery && Array.isArray(data.gallery)) {
    for (const image of data.gallery) {
      if (mode === "merge") {
        const existing = await db.galleryImage.findUnique({ where: { id: image.id } });

        if (existing) {
          await db.galleryImage.update({ where: { id: image.id }, data: image });
          results.gallery.updated++;
        } else {
          await db.galleryImage.create({ data: { ...image, id: undefined } });
          results.gallery.created++;
        }
      } else {
        await db.galleryImage.create({ data: image });
        results.gallery.created++;
      }
    }
  }

  if (data.journal && Array.isArray(data.journal)) {
    for (const entry of data.journal) {
      const { tags, ...entryData } = entry;
      let newEntry;

      if (mode === "merge") {
        const existing = await db.journalEntry.findUnique({ where: { id: entry.id } });

        if (existing) {
          newEntry = await db.journalEntry.update({ where: { id: entry.id }, data: entryData });
          results.journal.updated++;
        } else {
          newEntry = await db.journalEntry.create({ data: { ...entryData, id: undefined } });
          results.journal.created++;
        }
      } else {
        newEntry = await db.journalEntry.create({ data: { ...entryData, id: undefined } });
        results.journal.created++;
      }

      if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
          let tag = await db.tag.findUnique({ where: { name: tagName } });

          if (!tag) {
            tag = await db.tag.create({ data: { name: tagName } });
          }

          await db.journalTag.create({
            data: { journalEntryId: newEntry.id, tagId: tag.id },
          });
        }
      }
    }
  }

  if (data.settings) {
    const existing = await db.settings.findFirst();

    if (existing) {
      await db.settings.update({ where: { id: existing.id }, data: data.settings });
    } else {
      await db.settings.create({ data: data.settings });
    }

    results.settings = true;
  }

  await db.activityLog.create({
    data: {
      action: "import",
      resource: "data",
      details: JSON.stringify({ mode, results }),
    },
  });

  return successResponse({ results }, "Data imported successfully");
}

export const GET = withMiddleware(handleExport);
export const POST = withMiddleware(handleImport);
