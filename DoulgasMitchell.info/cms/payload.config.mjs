import { buildConfig } from 'payload/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { postgresAdapter } from '@payloadcms/db-postgres';

import Users from './src/collections/Users.mjs';
import Posts from './src/collections/Posts.mjs';
import Pages from './src/collections/Pages.mjs';
import Media from './src/collections/Media.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default buildConfig({
  serverURL: process.env.SERVER_URL,
  admin: {
    user: 'users',
    components: {
      // we can register global components here if needed
    }
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  collections: [Users, Posts, Pages, Media],
  typescript: false,
  // Serve uploaded files from /uploads
  cors: [
    process.env.SITE_DOMAIN ? `https://${process.env.SITE_DOMAIN}` : '',
    process.env.ADMIN_DOMAIN ? `https://${process.env.ADMIN_DOMAIN}` : ''
  ].filter(Boolean),
});
