import { db } from './db';

const SETTINGS_SINGLETON_ID = 'settings-singleton';

// Gallery Images Data
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  series: 'recent-post' | 'tech-deck' | 'project';
  width: number;
  height: number;
  date: string; // ISO date string for sorting
  blurDataUrl?: string; // Placeholder blur image
}

// Static gallery images (used as fallback)
export const galleryImages: GalleryImage[] = [
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
  },
];

export const seriesInfo = {
  'recent-post': {
    title: 'Recent Post',
    description: 'Key photography works exploring architecture and light',
  },
  'tech-deck': {
    title: 'Tech Deck',
    description: 'Technology and development workspace photography',
  },
  'project': {
    title: 'Project',
    description: 'Design and creative project documentation',
  },
};

// Journal Entries Data
export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
  quote?: string;
  image: string;
  imageAlt: string;
}

// Static journal entries (used as fallback)
export const journalEntries: JournalEntry[] = [
  {
    id: 'jr-1',
    title: 'Morning Ritual',
    date: '2024-12-15',
    tags: ['lifestyle', 'coffee'],
    content: `The first light of the day slipped through the curtains and landed on the steam from my pour-over. For a moment, everything felt quiet and intentional.

The aroma of coffee and the weight of a good book made a steady start to the morning.

Every sip felt like a reset. Every minute felt like \`time reclaimed\`.

> A simple morning ritual is one of the best investments in yourself.`,
    quote: 'Do not wait for better days. Build them, one habit at a time.',
    image: '/images/journal/jr-1.png',
    imageAlt: 'Morning coffee ritual',
  },
  {
    id: 'jr-2',
    title: 'Reading Hour',
    date: '2024-12-10',
    tags: ['reading', 'quiet'],
    content: `A dried flower bookmark fell from the page as I opened the book. The room was calm, the tea was warm, and the pace of the day slowed down.

Good writing has a way of making the world feel larger and more personal at the same time.

**Current shelf**:
- *The Little Prince*
- *One Hundred Years of Solitude*
- *Norwegian Wood*`,
    image: '/images/journal/jr-2.png',
    imageAlt: 'Reading with dried flowers bookmark',
  },
  {
    id: 'jr-3',
    title: 'City Walk',
    date: '2024-12-05',
    tags: ['travel', 'city'],
    content: `At golden hour, the city softened. Concrete became warm, windows caught fire with reflected light, and familiar streets felt new again.

Most people rushed past. I slowed down and watched the details.

**Walk route**:
1. Coffee shop in the old district
2. Riverside avenue
3. Main square at sunset`,
    quote: 'The best views are often waiting around ordinary corners.',
    image: '/images/journal/jr-3.png',
    imageAlt: 'City street at golden hour',
  },
  {
    id: 'jr-4',
    title: 'Small Green Things',
    date: '2024-11-28',
    tags: ['plants', 'lifestyle'],
    content: `A few plants on the windowsill changed the atmosphere of the room more than I expected.

Watching new leaves unfold is a quiet reminder that progress can be slow and still meaningful.

**Care notes**:
- Water twice a week
- Keep in bright, indirect light
- Wipe leaves regularly`,
    image: '/images/journal/jr-4.png',
    imageAlt: 'Minimalist desk plant',
  },
  {
    id: 'jr-5',
    title: 'Light and Memory',
    date: '2024-11-20',
    tags: ['photography', 'memory'],
    content: `I picked up an older camera today and listened to the shutter click with that mechanical certainty digital cameras rarely have.

Film slows everything down. You compose with care, wait with patience, and trust your instincts.

In a fast world, **slow photography feels like respect for time**.

\`ISO 400\` • \`f/2.8\` • \`1/125s\``,
    quote: 'Photography is memory with light attached to it.',
    image: '/images/journal/jr-5.png',
    imageAlt: 'Vintage camera on wooden surface',
  },
  {
    id: 'jr-6',
    title: 'Gentle Dusk',
    date: '2024-11-15',
    tags: ['sunset', 'calm'],
    content: `By the window at dusk, the sky turned soft orange and rose. Plant shadows stretched across the wall like a hand-drawn sketch.

Outside, the city stayed loud. Inside, the room settled into silence.

> Dusk is a daily reminder that endings can still be beautiful.`,
    image: '/images/journal/jr-6.png',
    imageAlt: 'Sunset through window with plants',
  },
];

// Hero Image
export const heroImage = {
  src: '/images/hero/hero-main.png',
  alt: 'Architectural Photography',
  caption: 'Where light meets structure, beauty emerges naturally.',
};

// Social Links
export const socialLinks = {
  linkedin: 'https://www.linkedin.com/in/douglas-mitchell-the-architect/',
  github: 'https://github.com/douglasmitchell',
  telegram: '#',
  whatsapp: '#',
};

// Available Time Slots
export const availableTimeSlots = [
  'Mon 9:00 - 12:00',
  'Tue 14:00 - 17:00',
  'Wed 9:00 - 12:00',
  'Thu 14:00 - 17:00',
  'Fri 10:00 - 15:00',
];

// Reaction Types
export type ReactionType = 'like' | 'love' | 'laugh' | 'shocked' | 'mad' | 'care';

export const reactionEmojis: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  laugh: '😄',
  shocked: '😮',
  mad: '😠',
  care: '🥰',
};

// ============ DATABASE FUNCTIONS ============

/**
 * Fetch gallery images from database
 * Falls back to static data if database is empty
 */
export async function getGalleryImages(filters?: {
  series?: string;
  search?: string;
  sortBy?: 'date' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}): Promise<{ items: GalleryImage[]; total: number }> {
  try {
    const {
      series,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      limit = 100,
      offset = 0,
    } = filters || {};

    const where = {
      ...(series ? { series } : {}),
      ...(search
        ? {
            OR: [
              { alt: { contains: search } },
              { caption: { contains: search } },
            ],
          }
        : {}),
    };

    const [dbImages, total] = await Promise.all([
      db.galleryImage.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      db.galleryImage.count({ where }),
    ]);

    // If database is empty, return static data
    if (dbImages.length === 0 && total === 0) {
      return {
        items: galleryImages,
        total: galleryImages.length,
      };
    }

    return {
      items: dbImages.map((img) => ({
        id: img.id,
        src: img.src,
        alt: img.alt,
        caption: img.caption,
        series: img.series as GalleryImage['series'],
        width: img.width,
        height: img.height,
        date: img.date,
        blurDataUrl: img.blurDataUrl || undefined,
      })),
      total,
    };
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    // Return static data on error
    return {
      items: galleryImages,
      total: galleryImages.length,
    };
  }
}

/**
 * Fetch journal entries from database
 * Falls back to static data if database is empty
 */
export async function getJournalEntries(filters?: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tag?: string;
  sortBy?: 'date' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}): Promise<{ items: JournalEntry[]; total: number }> {
  try {
    const {
      search,
      dateFrom,
      dateTo,
      tag,
      sortBy = 'date',
      sortOrder = 'desc',
      limit = 100,
      offset = 0,
    } = filters || {};

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        (where.date as Record<string, string>).gte = dateFrom;
      }
      if (dateTo) {
        (where.date as Record<string, string>).lte = dateTo;
      }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { name: tag },
        },
      };
    }

    const [dbEntries, total] = await Promise.all([
      db.journalEntry.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      db.journalEntry.count({ where }),
    ]);

    // If database is empty, return static data
    if (dbEntries.length === 0 && total === 0) {
      return {
        items: journalEntries,
        total: journalEntries.length,
      };
    }

    return {
      items: dbEntries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        date: entry.date,
        content: entry.content,
        quote: entry.quote || undefined,
        image: entry.image,
        imageAlt: entry.imageAlt,
        tags: entry.tags.map((t) => t.tag.name),
      })),
      total,
    };
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    // Return static data on error
    return {
      items: journalEntries,
      total: journalEntries.length,
    };
  }
}

/**
 * Fetch settings from database
 */
export async function getSettings() {
  try {
    const settings =
      (await db.settings.findUnique({ where: { id: SETTINGS_SINGLETON_ID } })) ??
      (await db.settings.findFirst({ orderBy: { updatedAt: 'desc' } }));
    if (settings) {
      return {
        siteTitle: settings.siteTitle,
        siteDescription: settings.siteDescription,
        linkedin: settings.linkedin || socialLinks.linkedin,
        github: settings.github || socialLinks.github,
        telegram: settings.telegram || socialLinks.telegram,
        whatsapp: settings.whatsapp || socialLinks.whatsapp,
      };
    }
    return {
      siteTitle: "Douglas Mitchell",
      siteDescription: 'A personal portfolio exploring architecture, technology, and creative expression',
      ...socialLinks,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      siteTitle: "Douglas Mitchell",
      siteDescription: 'A personal portfolio exploring architecture, technology, and creative expression',
      ...socialLinks,
    };
  }
}

/**
 * Fetch all unique tags from database
 */
export async function getTags(): Promise<string[]> {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: 'asc' },
    });
    if (tags.length > 0) {
      return tags.map((t) => t.name);
    }
    // Fallback to static data
    return [...new Set(journalEntries.flatMap((e) => e.tags))];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [...new Set(journalEntries.flatMap((e) => e.tags))];
  }
}

/**
 * Get activity log
 */
export async function getActivityLog(limit: number = 50) {
  try {
    return db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }
}
