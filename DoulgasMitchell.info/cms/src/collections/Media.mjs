import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Media = {
  slug: 'media',
  upload: {
    staticURL: '/uploads',
    staticDir: path.resolve(__dirname, '../../public/uploads'),
    imageSizes: [
      { name: 'card', width: 800, height: 600, position: 'centre' },
    ],
    adminThumbnail: 'card',
  },
  fields: [
    { name: 'altText', type: 'text', required: true },
  ],
};
export default Media;
