import { PrismaClient } from "@prisma/client";

type CanonicalEntry = {
  id: string;
  title: string;
  date: string;
  content: string;
  quote: string | null;
  image: string;
  imageAlt: string;
  order: number;
  tags: string[];
};

const prisma = new PrismaClient();

const canonicalEntries: Record<string, CanonicalEntry> = {
  "jr-1": {
    id: "jr-1",
    title: "Morning Ritual",
    date: "2024-12-15",
    content: `The first light of the day slipped through the curtains and landed on the steam from my pour-over. For a moment, everything felt quiet and intentional.

The aroma of coffee and the weight of a good book made a steady start to the morning.

Every sip felt like a reset. Every minute felt like \`time reclaimed\`.

> A simple morning ritual is one of the best investments in yourself.`,
    quote: "Do not wait for better days. Build them, one habit at a time.",
    image: "/images/journal/jr-1.png",
    imageAlt: "Morning coffee ritual",
    order: 1,
    tags: ["lifestyle", "coffee"],
  },
  "jr-2": {
    id: "jr-2",
    title: "Reading Hour",
    date: "2024-12-10",
    content: `A dried flower bookmark fell from the page as I opened the book. The room was calm, the tea was warm, and the pace of the day slowed down.

Good writing has a way of making the world feel larger and more personal at the same time.

**Current shelf**:
- *The Little Prince*
- *One Hundred Years of Solitude*
- *Norwegian Wood*`,
    quote: null,
    image: "/images/journal/jr-2.png",
    imageAlt: "Reading with dried flowers bookmark",
    order: 2,
    tags: ["reading", "quiet"],
  },
  "jr-3": {
    id: "jr-3",
    title: "City Walk",
    date: "2024-12-05",
    content: `At golden hour, the city softened. Concrete became warm, windows caught fire with reflected light, and familiar streets felt new again.

Most people rushed past. I slowed down and watched the details.

**Walk route**:
1. Coffee shop in the old district
2. Riverside avenue
3. Main square at sunset`,
    quote: "The best views are often waiting around ordinary corners.",
    image: "/images/journal/jr-3.png",
    imageAlt: "City street at golden hour",
    order: 3,
    tags: ["travel", "city"],
  },
  "jr-4": {
    id: "jr-4",
    title: "Small Green Things",
    date: "2024-11-28",
    content: `A few plants on the windowsill changed the atmosphere of the room more than I expected.

Watching new leaves unfold is a quiet reminder that progress can be slow and still meaningful.

**Care notes**:
- Water twice a week
- Keep in bright, indirect light
- Wipe leaves regularly`,
    quote: null,
    image: "/images/journal/jr-4.png",
    imageAlt: "Minimalist desk plant",
    order: 4,
    tags: ["plants", "lifestyle"],
  },
  "jr-5": {
    id: "jr-5",
    title: "Light and Memory",
    date: "2024-11-20",
    content: `I picked up an older camera today and listened to the shutter click with that mechanical certainty digital cameras rarely have.

Film slows everything down. You compose with care, wait with patience, and trust your instincts.

In a fast world, **slow photography feels like respect for time**.

\`ISO 400\` • \`f/2.8\` • \`1/125s\``,
    quote: "Photography is memory with light attached to it.",
    image: "/images/journal/jr-5.png",
    imageAlt: "Vintage camera on wooden surface",
    order: 5,
    tags: ["photography", "memory"],
  },
  "jr-6": {
    id: "jr-6",
    title: "Gentle Dusk",
    date: "2024-11-15",
    content: `By the window at dusk, the sky turned soft orange and rose. Plant shadows stretched across the wall like a hand-drawn sketch.

Outside, the city stayed loud. Inside, the room settled into silence.

> Dusk is a daily reminder that endings can still be beautiful.`,
    quote: null,
    image: "/images/journal/jr-6.png",
    imageAlt: "Sunset through window with plants",
    order: 6,
    tags: ["sunset", "calm"],
  },
};

const legacyTitleToId: Record<string, string> = {
  晨间仪式: "jr-1",
  阅读时光: "jr-2",
  城市漫步: "jr-3",
  绿意盎然: "jr-4",
  光影记忆: "jr-5",
  暮色温柔: "jr-6",
};

function hasCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

function getCanonicalId(entry: {
  id: string;
  title: string;
  order: number;
  content: string;
  tags: string[];
}): string | null {
  if (canonicalEntries[entry.id]) {
    return entry.id;
  }

  if (legacyTitleToId[entry.title]) {
    return legacyTitleToId[entry.title];
  }

  if (
    entry.order >= 1 &&
    entry.order <= 6 &&
    (hasCjk(entry.title) ||
      hasCjk(entry.content) ||
      entry.tags.some((tag) => hasCjk(tag)))
  ) {
    const candidate = `jr-${entry.order}`;
    return canonicalEntries[candidate] ? candidate : null;
  }

  return null;
}

async function run(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const apply = args.has("--apply");
  const strictTags = args.has("--strict-tags");

  const entries = await prisma.journalEntry.findMany({
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  const targets = entries
    .map((entry) => {
      const existingTagNames = entry.tags.map((t) => t.tag.name);
      const canonicalId = getCanonicalId({
        id: entry.id,
        title: entry.title,
        order: entry.order,
        content: entry.content,
        tags: existingTagNames,
      });

      if (!canonicalId) {
        return null;
      }

      return {
        entry,
        canonical: canonicalEntries[canonicalId],
        existingTagNames,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const cjkTags = await prisma.tag.findMany({
    include: {
      journals: true,
    },
  });

  const cjkTagRows = cjkTags.filter((tag) => hasCjk(tag.name));
  const globalCanonicalTags = new Set(
    Object.values(canonicalEntries).flatMap((entry) => entry.tags)
  );

  console.log("Journal English migration");
  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);
  console.log(`Targets detected: ${targets.length}`);
  console.log(`CJK tags detected: ${cjkTagRows.length}`);

  for (const target of targets) {
    const cjkEntryTagCount = target.existingTagNames.filter(hasCjk).length;
    const canonicalMissingCount = target.canonical.tags.filter(
      (tag) => !target.existingTagNames.includes(tag)
    ).length;
    console.log(
      `- ${target.entry.id}: "${target.entry.title}" -> "${target.canonical.title}" | cjkTags=${cjkEntryTagCount} missingCanonicalTags=${canonicalMissingCount}`
    );
  }

  if (!apply) {
    console.log("Dry run complete. Re-run with --apply to execute updates.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const target of targets) {
      await tx.journalEntry.update({
        where: { id: target.entry.id },
        data: {
          title: target.canonical.title,
          date: target.canonical.date,
          content: target.canonical.content,
          quote: target.canonical.quote,
          image: target.canonical.image,
          imageAlt: target.canonical.imageAlt,
          order: target.canonical.order,
        },
      });

      const canonicalTagRecords = await Promise.all(
        target.canonical.tags.map((tagName) =>
          tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          })
        )
      );

      const existingRelations = await tx.journalTag.findMany({
        where: { journalEntryId: target.entry.id },
        include: { tag: true },
      });

      const relationIdsToDelete = existingRelations
        .filter((relation) => {
          if (hasCjk(relation.tag.name)) {
            return true;
          }
          if (strictTags && !target.canonical.tags.includes(relation.tag.name)) {
            return true;
          }
          return false;
        })
        .map((relation) => relation.tagId);

      if (relationIdsToDelete.length > 0) {
        await tx.journalTag.deleteMany({
          where: {
            journalEntryId: target.entry.id,
            tagId: {
              in: relationIdsToDelete,
            },
          },
        });
      }

      const existingTagIds = new Set(existingRelations.map((relation) => relation.tagId));
      const createRows = canonicalTagRecords
        .filter((tag) => !existingTagIds.has(tag.id))
        .map((tag) => ({
          journalEntryId: target.entry.id,
          tagId: tag.id,
        }));

      if (createRows.length > 0) {
        await tx.journalTag.createMany({
          data: createRows,
          skipDuplicates: true,
        });
      }
    }

    const orphanCjkTags = await tx.tag.findMany({
      where: {},
      include: { journals: true },
    });

    const orphanTagIdsToDelete = orphanCjkTags
      .filter(
        (tag) =>
          hasCjk(tag.name) &&
          tag.journals.length === 0 &&
          !globalCanonicalTags.has(tag.name)
      )
      .map((tag) => tag.id);

    if (orphanTagIdsToDelete.length > 0) {
      await tx.tag.deleteMany({
        where: {
          id: {
            in: orphanTagIdsToDelete,
          },
        },
      });
    }
  });

  await prisma.activityLog.create({
    data: {
      action: "update",
      resource: "journal",
      details: JSON.stringify({
        migration: "journal-to-english",
        entriesUpdated: targets.length,
        strictTags,
      }),
    },
  });

  console.log(`Applied. Updated entries: ${targets.length}`);
}

run()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
