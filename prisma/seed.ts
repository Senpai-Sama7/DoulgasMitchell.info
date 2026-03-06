import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.journalTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.passkeyCredential.deleteMany();
  await prisma.session.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.requestLog.deleteMany();

  // Create admin user
  console.log("Creating admin user...");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is required for security reasons to set a strong admin password during seeding.");
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.create({
    data: {
      username: "admin",
      passwordHash,
      email: "admin@senpai-isekai.com",
    },
  });

  // Create tags
  console.log("Creating tags...");
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "architecture" } }),
    prisma.tag.create({ data: { name: "photography" } }),
    prisma.tag.create({ data: { name: "light" } }),
    prisma.tag.create({ data: { name: "shadows" } }),
    prisma.tag.create({ data: { name: "urban" } }),
    prisma.tag.create({ data: { name: "creative" } }),
    prisma.tag.create({ data: { name: "reflection" } }),
    prisma.tag.create({ data: { name: "perspective" } }),
  ]);

  // Create gallery images
  console.log("Creating gallery images...");
  const galleryImages = [
    {
      src: "/images/gallery/recent-post/gal-1.png",
      alt: "Urban Reflections",
      caption: "Morning light dancing on glass facades",
      series: "recent-post" as const,
      width: 1344,
      height: 768,
      date: "2024-12-28",
    },
    {
      src: "/images/gallery/recent-post/gal-2.png",
      alt: "Shadows and Light",
      caption: "The interplay of shadow and illumination",
      series: "recent-post" as const,
      width: 1344,
      height: 768,
      date: "2024-12-25",
    },
    {
      src: "/images/gallery/recent-post/gal-3.png",
      alt: "Geometric Harmony",
      caption: "Finding patterns in urban architecture",
      series: "recent-post" as const,
      width: 1344,
      height: 768,
      date: "2024-12-22",
    },
    {
      src: "/images/gallery/tech-deck/gal-4.png",
      alt: "Workspace Stories",
      caption: "The creative sanctuary where ideas take form",
      series: "tech-deck" as const,
      width: 1344,
      height: 768,
      date: "2024-12-20",
    },
    {
      src: "/images/gallery/tech-deck/gal-5.png",
      alt: "Digital Garden",
      caption: "Tools of the modern craft",
      series: "tech-deck" as const,
      width: 1344,
      height: 768,
      date: "2024-12-18",
    },
    {
      src: "/images/gallery/project/gal-6.png",
      alt: "Project Vision",
      caption: "Conceptualizing spaces yet to exist",
      series: "project" as const,
      width: 1344,
      height: 768,
      date: "2024-12-15",
    },
  ];

  for (let i = 0; i < galleryImages.length; i++) {
    await prisma.galleryImage.create({
      data: {
        ...galleryImages[i],
        order: i,
      },
    });
  }

  // Create journal entries
  console.log("Creating journal entries...");
  const journalEntries = [
    {
      title: "The Quiet Beauty of Concrete",
      date: "2024-12-28",
      content: `There's a certain poetry in concrete structures that many overlook. The way light plays across brutalist facades, creating dramatic shadows that shift throughout the day. Each surface tells a story of intention and function.

I've been spending my mornings documenting these interactions between natural light and human-made geometry. The results have been surprising—what initially seemed cold and uninviting reveals itself to be warm and dynamic when observed patiently.

The key is to arrive early, when the sun is still low and the shadows are long. This is when the architecture truly speaks, revealing its secrets to those willing to listen.`,
      quote: "Architecture is the learned game, correct and magnificent, of forms assembled in the light.",
      image: "/images/journal/jr-1.png",
      imageAlt: "Concrete architecture in morning light",
      tags: ["architecture", "light", "perspective"],
    },
    {
      title: "Reflections on Urban Spaces",
      date: "2024-12-22",
      content: `Cities are mirrors. They reflect not just the physical world around us, but our collective aspirations, our relationship with space, and our endless desire to reach toward the sky.

Walking through downtown at golden hour, I'm struck by how glass buildings transform into canvases of light. The sunset doesn't just illuminate these structures—it turns them into participants in a daily performance that few pause to appreciate.

My challenge this month has been to capture these fleeting moments, to freeze in time the ephemeral beauty that exists between day and night.`,
      quote: "The city is not a problem to be solved, but a reality to be experienced.",
      image: "/images/journal/jr-2.png",
      imageAlt: "Urban skyline at golden hour",
      tags: ["urban", "photography", "light"],
    },
    {
      title: "Shadows as Subject",
      date: "2024-12-15",
      content: `We've been taught to fear shadows in photography, to always seek the light. But what happens when we make shadow our primary subject?

This question has driven my recent work. By exposing for the highlights and letting shadows fall where they may, I've discovered a new visual language. The absence of light becomes as important as its presence.

In these images, shadow isn't merely background—it's the protagonist. The light exists to give form to darkness, to carve out negative space that speaks as loudly as any illuminated subject.`,
      quote: "Where there is much light, the shadow is deep.",
      image: "/images/journal/jr-3.png",
      imageAlt: "Dramatic shadows in architectural space",
      tags: ["shadows", "creative", "architecture"],
    },
  ];

  for (let i = 0; i < journalEntries.length; i++) {
    const entry = journalEntries[i];
    const tagNames = entry.tags;

    const createdEntry = await prisma.journalEntry.create({
      data: {
        title: entry.title,
        date: entry.date,
        content: entry.content,
        quote: entry.quote,
        image: entry.image,
        imageAlt: entry.imageAlt,
        order: i,
      },
    });

    // Connect tags
    for (const tagName of tagNames) {
      const tag = tags.find((t) => t.name === tagName);
      if (tag) {
        await prisma.journalTag.create({
          data: {
            journalEntryId: createdEntry.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  // Create settings
  console.log("Creating settings...");
  await prisma.settings.create({
    data: {
      siteTitle: "Senpai's Isekai",
      siteDescription:
        "A personal blog exploring architecture, technology, and creative expression",
      linkedin: "https://linkedin.com/in/douglasmitchell",
      github: "https://github.com/douglasmitchell",
    },
  });

  // Create initial activity log
  console.log("Creating activity log...");
  await prisma.activityLog.create({
    data: {
      action: "create",
      resource: "system",
      details: "Database seeded with initial data",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
