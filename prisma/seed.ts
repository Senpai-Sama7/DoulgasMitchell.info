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
    title: '晨间仪式',
    date: '2024-12-15',
    content: `清晨的第一缕阳光穿过窗帘，落在手冲咖啡的蒸汽上。这一刻，时间仿佛静止。

**咖啡的香气与书香交织**，构成了最美妙的早晨序曲。

每一口都是对生活的礼赞，每一秒都是\`与自己对话\`的珍贵时光。

> 早晨的仪式感，是对自己最好的投资。`,
    quote: '生活不是等待暴风雨过去，而是学会在雨中起舞。',
    image: '/images/journal/jr-1.png',
    imageAlt: 'Morning coffee ritual',
    order: 1,
    tags: ['生活', '咖啡'],
  },
  {
    id: 'jr-2',
    title: '阅读时光',
    date: '2024-12-10',
    content: `翻开书页，干花书签轻轻滑落。文字在指尖流淌，故事在心中绽放。

这个下午，阳光正好，茶温刚好，一本好书便是最完美的伴侣。

在字里行间寻找自己，在故事中遇见世界。

**今日推荐**：
- 《挪威的森林》
- 《百年孤独》
- 《小王子》`,
    image: '/images/journal/jr-2.png',
    imageAlt: 'Reading with dried flowers bookmark',
    order: 2,
    tags: ['阅读', '静谧'],
  },
  {
    id: 'jr-3',
    title: '城市漫步',
    date: '2024-12-05',
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
    order: 3,
    tags: ['旅行', '城市'],
  },
  {
    id: 'jr-4',
    title: '绿意盎然',
    date: '2024-11-28',
    content: `窗台上的小植物，是生活中最简单的快乐。

看着它们在阳光下舒展叶片，仿佛也能感受到生命的律动。

养护植物教会我耐心与专注，每一片新叶都是对细心照料的最好回报。

**养护心得**：
- 每周浇水两次
- 保持散射光照射
- 定期擦拭叶片`,
    image: '/images/journal/jr-4.png',
    imageAlt: 'Minimalist desk plant',
    order: 4,
    tags: ['植物', '生活'],
  },
  {
    id: 'jr-5',
    title: '光影记忆',
    date: '2024-11-20',
    content: `拿起老相机，感受机械快门的清脆声响。

每一张胶片都是对瞬间的珍重承诺，等待显影的过程充满期待。

在这个数码时代，**慢摄影是一种仪式**，是对时间的敬畏。

\`ISO 400\` • \`f/2.8\` • \`1/125s\``,
    quote: '摄影是将瞬间凝固成永恒的艺术。',
    image: '/images/journal/jr-5.png',
    imageAlt: 'Vintage camera on wooden surface',
    order: 5,
    tags: ['摄影', '回忆'],
  },
  {
    id: 'jr-6',
    title: '暮色温柔',
    date: '2024-11-15',
    content: `日落时分的窗边，天空被染成温柔的橙粉色。

室内植物的剪影投射在墙上，构成一幅天然的水墨画。

这一刻，城市的喧嚣被隔绝在外，只剩下内心的宁静与满足。

> 黄昏是一天中最温柔的时刻，它提醒我们：结束也可以如此美丽。`,
    image: '/images/journal/jr-6.png',
    imageAlt: 'Sunset through window with plants',
    order: 6,
    tags: ['黄昏', '宁静'],
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
  const adminPassword = process.env.ADMIN_PASSWORD || 'senpai2024';
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
