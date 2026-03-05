import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import { withMiddleware, successResponse, validateInput, AuthenticationError, ValidationError } from "@/lib/middleware";
import { importDataSchema } from "@/lib/validations";

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
  const bodyRecord = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const parsed = validateInput(importDataSchema, {
    ...bodyRecord,
    mode: typeof bodyRecord.mode === "string" ? bodyRecord.mode : "merge",
  });
  const sourceData = parsed.data ?? parsed;
  const galleryItems = sourceData.gallery ?? sourceData.galleryImages ?? [];
  const journalItems = sourceData.journal ?? sourceData.journalEntries ?? [];
  const importSettings = sourceData.settings;

  if (galleryItems.length === 0 && journalItems.length === 0 && !importSettings) {
    throw new ValidationError("No import data provided");
  }

  const results = {
    gallery: { created: 0, updated: 0 },
    journal: { created: 0, updated: 0 },
    settings: false,
  };

  await db.$transaction(async (tx) => {
    if (parsed.mode === "replace") {
      await tx.journalTag.deleteMany();
      await tx.journalEntry.deleteMany();
      await tx.galleryImage.deleteMany();
      await tx.settings.deleteMany();
    }

    for (const image of galleryItems) {
      const { id, ...imageData } = image;
      if (parsed.mode === "merge" && id) {
        const existing = await tx.galleryImage.findUnique({ where: { id } });
        if (existing) {
          await tx.galleryImage.update({ where: { id }, data: imageData });
          results.gallery.updated++;
          continue;
        }
      }

      await tx.galleryImage.create({
        data: id && parsed.mode === "replace" ? { ...imageData, id } : imageData,
      });
      results.gallery.created++;
    }

    for (const entry of journalItems) {
      const { id, tags, ...entryData } = entry;
      let newEntry;

      if (parsed.mode === "merge" && id) {
        const existing = await tx.journalEntry.findUnique({ where: { id } });
        if (existing) {
          newEntry = await tx.journalEntry.update({ where: { id }, data: entryData });
          await tx.journalTag.deleteMany({ where: { journalEntryId: id } });
          results.journal.updated++;
        }
      }

      if (!newEntry) {
        newEntry = await tx.journalEntry.create({
          data: id && parsed.mode === "replace" ? { ...entryData, id } : entryData,
        });
        results.journal.created++;
      }

      if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
          let tag = await tx.tag.findUnique({ where: { name: tagName } });
          if (!tag) {
            tag = await tx.tag.create({ data: { name: tagName } });
          }

          await tx.journalTag.create({
            data: { journalEntryId: newEntry.id, tagId: tag.id },
          });
        }
      }
    }

    if (importSettings) {
      const existing = await tx.settings.findFirst();
      if (existing) {
        await tx.settings.update({ where: { id: existing.id }, data: importSettings });
      } else {
        await tx.settings.create({ data: importSettings });
      }
      results.settings = true;
    }

    await tx.activityLog.create({
      data: {
        action: "import",
        resource: "data",
        details: JSON.stringify({ mode: parsed.mode, results }),
      },
    });
  });

  return successResponse({ results }, "Data imported successfully");
}

export const GET = withMiddleware(handleExport);
export const POST = withMiddleware(handleImport);
