import { db } from './db';

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
    title: '晨间仪式',
    date: '2024-12-15',
    tags: ['生活', '咖啡'],
    content: `清晨的第一缕阳光穿过窗帘，落在手冲咖啡的蒸汽上。这一刻，时间仿佛静止。

**咖啡的香气与书香交织**，构成了最美妙的早晨序曲。

每一口都是对生活的礼赞，每一秒都是\`与自己对话\`的珍贵时光。

> 早晨的仪式感，是对自己最好的投资。`,
    quote: '生活不是等待暴风雨过去，而是学会在雨中起舞。',
    image: '/images/journal/jr-1.png',
    imageAlt: 'Morning coffee ritual',
  },
  {
    id: 'jr-2',
    title: '阅读时光',
    date: '2024-12-10',
    tags: ['阅读', '静谧'],
    content: `翻开书页，干花书签轻轻滑落。文字在指尖流淌，故事在心中绽放。

这个下午，阳光正好，茶温刚好，一本好书便是最完美的伴侣。

在字里行间寻找自己，在故事中遇见世界。

**今日推荐**：
- 《挪威的森林》
- 《百年孤独》
- 《小王子》`,
    image: '/images/journal/jr-2.png',
    imageAlt: 'Reading with dried flowers bookmark',
  },
  {
    id: 'jr-3',
    title: '城市漫步',
    date: '2024-12-05',
    tags: ['旅行', '城市'],
    content: `黄昏时分漫步于城市街巷，金色阳光将每一座建筑镀上温暖。

行人匆匆，而我选择慢下来，捕捉那些被忽略的美好瞬间。

城市的脉搏在这一刻显得格外温柔，每一帧都值得被铭记。

**漫步路线**：
1. 老城区的咖啡馆
2. 河边的梧桐大道
3. 日落时分的广场`,
    quote: '最美的风景，往往藏在最不经意的转角。',
    image: '/images/journal/jr-3.png',
    imageAlt: 'City street at golden hour',
  },
  {
    id: 'jr-4',
    title: '绿意盎然',
    date: '2024-11-28',
    tags: ['植物', '生活'],
    content: `窗台上的小植物，是生活中最简单的快乐。

看着它们在阳光下舒展叶片，仿佛也能感受到生命的律动。

养护植物教会我耐心与专注，每一片新叶都是对细心照料的最好回报。

**养护心得**：
- 每周浇水两次
- 保持散射光照射
- 定期擦拭叶片`,
    image: '/images/journal/jr-4.png',
    imageAlt: 'Minimalist desk plant',
  },
  {
    id: 'jr-5',
    title: '光影记忆',
    date: '2024-11-20',
    tags: ['摄影', '回忆'],
    content: `拿起老相机，感受机械快门的清脆声响。

每一张胶片都是对瞬间的珍重承诺，等待显影的过程充满期待。

在这个数码时代，**慢摄影是一种仪式**，是对时间的敬畏。

\`ISO 400\` • \`f/2.8\` • \`1/125s\``,
    quote: '摄影是将瞬间凝固成永恒的艺术。',
    image: '/images/journal/jr-5.png',
    imageAlt: 'Vintage camera on wooden surface',
  },
  {
    id: 'jr-6',
    title: '暮色温柔',
    date: '2024-11-15',
    tags: ['黄昏', '宁静'],
    content: `日落时分的窗边，天空被染成温柔的橙粉色。

室内植物的剪影投射在墙上，构成一幅天然的水墨画。

这一刻，城市的喧嚣被隔绝在外，只剩下内心的宁静与满足。

> 黄昏是一天中最温柔的时刻，它提醒我们：结束也可以如此美丽。`,
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
  github: 'https://github.com/Senpai-Sama7',
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

    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
            ],
          }
        : {}),
      ...(dateFrom ? { date: { gte: dateFrom } } : {}),
      ...(dateTo ? { date: { lte: dateTo } } : {}),
      ...(tag
        ? {
            tags: {
              some: {
                tag: { name: tag },
              },
            },
          }
        : {}),
    };

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
    const settings = await db.settings.findFirst();
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
      siteTitle: "Senpai's Isekai",
      siteDescription: 'A personal blog exploring architecture, technology, and creative expression',
      ...socialLinks,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      siteTitle: "Senpai's Isekai",
      siteDescription: 'A personal blog exploring architecture, technology, and creative expression',
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
