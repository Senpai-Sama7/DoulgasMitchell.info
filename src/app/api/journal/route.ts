import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/security";
import {
  withMiddleware,
  successResponse,
  validateInput,
} from "@/lib/middleware";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  journalFilterSchema,
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

async function handleGetJournal(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const filterInput = {
    search: searchParams.get("search") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    tag: searchParams.get("tag") || undefined,
    sortBy: searchParams.get("sortBy") || "date",
    sortOrder: searchParams.get("sortOrder") || "desc",
    limit: parseInt(searchParams.get("limit") || "20", 10),
    offset: parseInt(searchParams.get("offset") || "0", 10),
  };

  const filter = validateInput(journalFilterSchema, filterInput);

  const where: Record<string, unknown> = {};

  if (filter.search) {
    where.OR = [
      { title: { contains: filter.search, mode: "insensitive" } },
      { content: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  if (filter.dateFrom || filter.dateTo) {
    where.date = {};
    if (filter.dateFrom) {
      (where.date as Record<string, Date>).gte = filter.dateFrom;
    }
    if (filter.dateTo) {
      (where.date as Record<string, Date>).lte = filter.dateTo;
    }
  }

  const [entries, total] = await Promise.all([
    db.journalEntry.findMany({
      where,
      orderBy: [{ order: "asc" }, { date: filter.sortOrder }],
      include: { tags: { include: { tag: true } } },
      take: filter.limit,
      skip: filter.offset,
    }),
    db.journalEntry.count({ where }),
  ]);

  const transformedEntries = entries.map((entry) => ({
    ...entry,
    tags: entry.tags.map((t) => t.tag.name),
  }));

  return NextResponse.json({
    success: true,
    data: {
      items: transformedEntries,
      total,
      limit: filter.limit,
      offset: filter.offset,
      hasMore: filter.offset + entries.length < total,
    },
  });
}

async function handleCreateJournal(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const body = await request.json();
  const data = validateInput(createJournalEntrySchema, body);

  const maxOrderEntry = await db.journalEntry.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (maxOrderEntry?.order || 0) + 1;

  const entry = await db.journalEntry.create({
    data: {
      title: data.title,
      date: data.date,
      content: data.content,
      quote: data.quote,
      image: data.image,
      imageAlt: data.imageAlt || data.title,
      order,
    },
  });

  if (data.tags && data.tags.length > 0) {
    for (const tagName of data.tags) {
      let tag = await db.tag.findUnique({ where: { name: tagName } });

      if (!tag) {
        tag = await db.tag.create({ data: { name: tagName } });
      }

      await db.journalTag.create({
        data: { journalEntryId: entry.id, tagId: tag.id },
      });
    }
  }

  await db.activityLog.create({
    data: {
      action: "create",
      resource: "journal",
      resourceId: entry.id,
      details: JSON.stringify({ title: data.title }),
    },
  });

  return successResponse(entry, "Entry created successfully");
}

async function handleUpdateJournal(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const body = await request.json();
  const { id, tags, ...updateData } = body;

  if (!id) {
    throw new Error("Entry ID is required");
  }

  const data = validateInput(updateJournalEntrySchema, updateData);

  const entry = await db.journalEntry.update({
    where: { id },
    data,
  });

  if (tags && Array.isArray(tags)) {
    await db.journalTag.deleteMany({ where: { journalEntryId: id } });

    for (const tagName of tags) {
      let tag = await db.tag.findUnique({ where: { name: tagName } });

      if (!tag) {
        tag = await db.tag.create({ data: { name: tagName } });
      }

      await db.journalTag.create({
        data: { journalEntryId: id, tagId: tag.id },
      });
    }
  }

  await db.activityLog.create({
    data: {
      action: "update",
      resource: "journal",
      resourceId: entry.id,
      details: JSON.stringify({ title: entry.title }),
    },
  });

  return successResponse(entry, "Entry updated successfully");
}

async function handleDeleteJournal(
  request: NextRequest
): Promise<NextResponse> {
  await authenticateRequest(request);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const ids = searchParams.get("ids");

  if (ids) {
    const idArray = ids.split(",");

    await db.journalTag.deleteMany({ where: { journalEntryId: { in: idArray } } });
    await db.journalEntry.deleteMany({ where: { id: { in: idArray } } });

    await db.activityLog.create({
      data: {
        action: "delete",
        resource: "journal",
        details: JSON.stringify({ count: idArray.length, ids: idArray }),
      },
    });

    return successResponse(undefined, `${idArray.length} entries deleted`);
  }

  if (!id) {
    throw new Error("Entry ID is required");
  }

  await db.journalTag.deleteMany({ where: { journalEntryId: id } });
  await db.journalEntry.delete({ where: { id } });

  await db.activityLog.create({
    data: {
      action: "delete",
      resource: "journal",
      resourceId: id,
    },
  });

  return successResponse(undefined, "Entry deleted successfully");
}

export const GET = withMiddleware(handleGetJournal);
export const POST = withMiddleware(handleCreateJournal);
export const PUT = withMiddleware(handleUpdateJournal);
export const DELETE = withMiddleware(handleDeleteJournal);
