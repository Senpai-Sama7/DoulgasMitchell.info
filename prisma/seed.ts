import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Gallery images data
const galleryImages = [
  // Recent Post Series
  {
    id: 'rp-1',
    src: '/images/gallery/recent-post/rp-1.png',
    alt: 'Glass Facade Architecture',
    caption: 'Modern glass facade reflecting the warm sunset sky, where structure meets natural beauty.',
    series: 'recent-post',
    width: 1344,
    height: 768,
    date: '2024-12-15',
    order: 1,
  },
  {
    id: 'rp-2',
    src: '/images/gallery/recent-post/rp-2.png',
    alt: 'Concrete Textures',
    caption: 'A study in concrete textures, where light and shadow dance across minimalist surfaces.',
    series: 'recent-post',
    width: 768,
    height: 1344,
    date: '2024-12-12',
    order: 2,
  },
  {
    id: 'rp-3',
    src: '/images/gallery/recent-post/rp-3.png',
    alt: 'Modern Staircase',
    caption: 'Clean lines of a modern staircase, illuminated by soft natural light.',
    series: 'recent-post',
    width: 1344,
    height: 768,
    date: '2024-12-10',
    order: 3,
  },
  {
    id: 'rp-4',
    src: '/images/gallery/recent-post/rp-4.png',
    alt: 'Geometric Patterns',
    caption: 'Architectural abstraction through geometric patterns of light and shadow.',
    series: 'recent-post',
    width: 1344,
    height: 768,
    date: '2024-12-08',
    order: 4,
  },
  {
    id: 'rp-5',
    src: '/images/gallery/recent-post/rp-5.png',
    alt: 'Vertical Architecture',
    caption: 'Vertical lines of glass and steel reaching toward the warm afternoon sky.',
    series: 'recent-post',
    width: 768,
    height: 1344,
    date: '2024-12-05',
    order: 5,
  },
  {
    id: 'rp-6',
    src: '/images/gallery/recent-post/rp-6.png',
    alt: 'Museum Interior',
    caption: 'The serene interior of a contemporary museum, where space becomes art.',
    series: 'recent-post',
    width: 1344,
    height: 768,
    date: '2024-12-01',
    order: 6,
  },

  // Tech Deck Series
  {
    id: 'td-1',
    src: '/images/gallery/tech-deck/td-1.png',
    alt: 'Developer Workspace',
    caption: 'A clean developer setup where ideas transform into code.',
    series: 'tech-deck',
    width: 1344,
    height: 768,
    date: '2024-11-28',
    order: 7,
  },
  {
    id: 'td-2',
    src: '/images/gallery/tech-deck/td-2.png',
    alt: 'Mechanical Keyboard',
    caption: 'The tactile beauty of mechanical precision, crafted for creators.',
    series: 'tech-deck',
    width: 1024,
    height: 1024,
    date: '2024-11-25',
    order: 8,
  },
  {
    id: 'td-3',
    src: '/images/gallery/tech-deck/td-3.png',
    alt: 'Server Infrastructure',
    caption: 'The backbone of digital infrastructure, where data flows silently.',
    series: 'tech-deck',
    width: 1344,
    height: 768,
    date: '2024-11-20',
    order: 9,
  },
  {
    id: 'td-4',
    src: '/images/gallery/tech-deck/td-4.png',
    alt: 'Laptop Workspace',
    caption: 'A moment of focused creation, where coffee and code intertwine.',
    series: 'tech-deck',
    width: 768,
    height: 1344,
    date: '2024-11-15',
    order: 10,
  },
  {
    id: 'td-5',
    src: '/images/gallery/tech-deck/td-5.png',
    alt: 'Abstract Technology',
    caption: 'Floating geometries representing the ethereal nature of digital design.',
    series: 'tech-deck',
    width: 1344,
    height: 768,
    date: '2024-11-10',
    order: 11,
  },
  {
    id: 'td-6',
    src: '/images/gallery/tech-deck/td-6.png',
    alt: 'Code Editor',
    caption: 'Syntax highlighted in warm tones, where logic becomes poetry.',
    series: 'tech-deck',
    width: 1344,
    height: 768,
    date: '2024-11-05',
    order: 12,
  },

  // Project Series
  {
    id: 'pj-1',
    src: '/images/gallery/project/pj-1.png',
    alt: 'Dashboard Design',
    caption: 'A modern dashboard interface, balancing function and aesthetics.',
    series: 'project',
    width: 1344,
    height: 768,
    date: '2024-10-28',
    order: 13,
  },
  {
    id: 'pj-2',
    src: '/images/gallery/project/pj-2.png',
    alt: 'Mobile App Design',
    caption: 'Minimalist mobile interface, designed for intuitive interaction.',
    series: 'project',
    width: 768,
    height: 1344,
    date: '2024-10-22',
    order: 14,
  },
  {
    id: 'pj-3',
    src: '/images/gallery/project/pj-3.png',
    alt: 'Creative Workspace',
    caption: "Where ideas take form - a designer's creative sanctuary.",
    series: 'project',
    width: 1344,
    height: 768,
    date: '2024-10-15',
    order: 15,
  },
  {
    id: 'pj-4',
    src: '/images/gallery/project/pj-4.png',
    alt: 'Geometric Composition',
    caption: 'Abstract geometric composition exploring form and space.',
    series: 'project',
    width: 1344,
    height: 768,
    date: '2024-10-08',
    order: 16,
  },
  {
    id: 'pj-5',
    src: '/images/gallery/project/pj-5.png',
    alt: 'Brand Identity',
    caption: 'Tactile brand materials, where identity meets craft.',
    series: 'project',
    width: 768,
    height: 1344,
    date: '2024-10-01',
    order: 17,
  },
  {
    id: 'pj-6',
    src: '/images/gallery/project/pj-6.png',
    alt: 'Design Process',
    caption: 'The beautiful mess of creation - wireframes and sketches in progress.',
    series: 'project',
    width: 1344,
    height: 768,
    date: '2024-09-25',
    order: 18,
  },
];

// Journal entries data
const journalEntries = [
  {
    id: 'jr-1',
    title: 'Morning Ritual',
    date: '2024-12-15',
    content: `The first light of the day slipped through the curtains and landed on the steam from my pour-over. For a moment, everything felt quiet and intentional.

The aroma of coffee and the weight of a good book made a steady start to the morning.

Every sip felt like a reset. Every minute felt like \`time reclaimed\`.

> A simple morning ritual is one of the best investments in yourself.`,
    quote: 'Do not wait for better days. Build them, one habit at a time.',
    image: '/images/journal/jr-1.png',
    imageAlt: 'Morning coffee ritual',
    order: 1,
    tags: ['lifestyle', 'coffee'],
  },
  {
    id: 'jr-2',
    title: 'Reading Hour',
    date: '2024-12-10',
    content: `A dried flower bookmark fell from the page as I opened the book. The room was calm, the tea was warm, and the pace of the day slowed down.

Good writing has a way of making the world feel larger and more personal at the same time.

**Current shelf**:
- *The Little Prince*
- *One Hundred Years of Solitude*
- *Norwegian Wood*`,
    image: '/images/journal/jr-2.png',
    imageAlt: 'Reading with dried flowers bookmark',
    order: 2,
    tags: ['reading', 'quiet'],
  },
  {
    id: 'jr-3',
    title: 'City Walk',
    date: '2024-12-05',
    content: `At golden hour, the city softened. Concrete became warm, windows caught fire with reflected light, and familiar streets felt new again.

Most people rushed past. I slowed down and watched the details.

**Walk route**:
1. Coffee shop in the old district
2. Riverside avenue
3. Main square at sunset`,
    quote: 'The best views are often waiting around ordinary corners.',
    image: '/images/journal/jr-3.png',
    imageAlt: 'City street at golden hour',
    order: 3,
    tags: ['travel', 'city'],
  },
  {
    id: 'jr-4',
    title: 'Small Green Things',
    date: '2024-11-28',
    content: `A few plants on the windowsill changed the atmosphere of the room more than I expected.

Watching new leaves unfold is a quiet reminder that progress can be slow and still meaningful.

**Care notes**:
- Water twice a week
- Keep in bright, indirect light
- Wipe leaves regularly`,
    image: '/images/journal/jr-4.png',
    imageAlt: 'Minimalist desk plant',
    order: 4,
    tags: ['plants', 'lifestyle'],
  },
  {
    id: 'jr-5',
    title: 'Light and Memory',
    date: '2024-11-20',
    content: `I picked up an older camera today and listened to the shutter click with that mechanical certainty digital cameras rarely have.

Film slows everything down. You compose with care, wait with patience, and trust your instincts.

In a fast world, **slow photography feels like respect for time**.

\`ISO 400\` • \`f/2.8\` • \`1/125s\``,
    quote: 'Photography is memory with light attached to it.',
    image: '/images/journal/jr-5.png',
    imageAlt: 'Vintage camera on wooden surface',
    order: 5,
    tags: ['photography', 'memory'],
  },
  {
    id: 'jr-6',
    title: 'Gentle Dusk',
    date: '2024-11-15',
    content: `By the window at dusk, the sky turned soft orange and rose. Plant shadows stretched across the wall like a hand-drawn sketch.

Outside, the city stayed loud. Inside, the room settled into silence.

> Dusk is a daily reminder that endings can still be beautiful.`,
    image: '/images/journal/jr-6.png',
    imageAlt: 'Sunset through window with plants',
    order: 6,
    tags: ['sunset', 'calm'],
  },
];

// Tags to create
const allTags = [...new Set(journalEntries.flatMap((entry) => entry.tags))];

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.journalTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.session.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.requestLog.deleteMany();

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set before running seed');
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.create({
    data: {
      username: 'admin',
      passwordHash,
      email: 'admin@senpai-isekai.com',
    },
  });

  // Create tags
  console.log('Creating tags...');
  for (const tagName of allTags) {
    await prisma.tag.create({
      data: { name: tagName },
    });
  }

  // Create gallery images
  console.log('Creating gallery images...');
  for (const image of galleryImages) {
    await prisma.galleryImage.create({
      data: {
        id: image.id,
        src: image.src,
        alt: image.alt,
        caption: image.caption,
        series: image.series,
        width: image.width,
        height: image.height,
        date: image.date,
        order: image.order,
      },
    });
  }

  // Create journal entries
  console.log('Creating journal entries...');
  for (const entry of journalEntries) {
    const { tags, ...entryData } = entry;

    const createdEntry = await prisma.journalEntry.create({
      data: {
        id: entry.id,
        title: entryData.title,
        date: entryData.date,
        content: entryData.content,
        quote: entryData.quote,
        image: entryData.image,
        imageAlt: entryData.imageAlt,
        order: entryData.order,
      },
    });

    // Create tag relations
    for (const tagName of tags) {
      const tag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

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

  // Create default settings
  console.log('Creating settings...');
  await prisma.settings.create({
    data: {
      siteTitle: "Senpai's Isekai",
      siteDescription:
        'A personal blog exploring architecture, technology, and creative expression',
      linkedin: 'https://www.linkedin.com/in/douglas-mitchell-the-architect/',
      github: 'https://github.com/Senpai-Sama7',
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      action: 'import',
      resource: 'system',
      details: JSON.stringify({
        galleryCount: galleryImages.length,
        journalCount: journalEntries.length,
        tagCount: allTags.length,
      }),
    },
  });

  console.log('Seed completed successfully!');
  console.log(`- Admin user: admin (password: ${adminPassword})`);
  console.log(`- Gallery images: ${galleryImages.length}`);
  console.log(`- Journal entries: ${journalEntries.length}`);
  console.log(`- Tags: ${allTags.length}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
