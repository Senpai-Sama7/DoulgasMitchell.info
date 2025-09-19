import payload from 'payload';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function seed(){
  try{
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
    });

    // Create admin user if not exists
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if(email && password){
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1
      });
      if(!existing?.docs?.length){
        await payload.create({
          collection: 'users',
          data: { email, password, name: 'Admin' }
        });
        payload.logger.info('👤 Seeded admin user');
      } else {
        payload.logger.info('👤 Admin user already exists');
      }
    }

    // Create home page
    const layoutPath = path.resolve('src/seed/home-layout.html');
    const layoutHtml = fs.readFileSync(layoutPath, 'utf-8');
    const homeExisting = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      limit: 1
    });
    if(!homeExisting?.docs?.length){
      await payload.create({
        collection: 'pages',
        data: { title: 'Home', slug: 'home', layoutHtml }
      });
      payload.logger.info('🏠 Seeded home page');
    } else {
      payload.logger.info('🏠 Home page already exists');
    }

    // Create posts
    const postsSeed = JSON.parse(fs.readFileSync(path.resolve('src/seed/posts.json'),'utf-8'));
    for(const post of postsSeed.posts){
      const exists = await payload.find({
        collection: 'posts',
        where: { slug: { equals: post.slug } },
        limit: 1
      });
      if(!exists?.docs?.length){
        await payload.create({ collection: 'posts', data: post });
        payload.logger.info(`✍️  Seeded post: ${post.title}`);
      }
    }
  }catch(e){
    console.error('Seed error:', e);
  }finally{
    // always exit to let container continue
    process.exit(0);
  }
}
seed();
