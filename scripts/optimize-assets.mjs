import sharp from 'sharp';
import fs from 'fs';
import path from 'fs';

async function optimize() {
  // Optimize Book Cover
  await sharp('public/images/the-confident-mind.jpg')
    .resize(400) // Display width is ~377px
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile('public/images/the-confident-mind-opt.jpg');
  fs.renameSync('public/images/the-confident-mind-opt.jpg', 'public/images/the-confident-mind.jpg');

  // Optimize Google Certificate
  await sharp('public/images/certs/google-ai-professional-certificate.png')
    .resize(400) // Display width is ~330px
    .png({ quality: 80, compressionLevel: 9 })
    .toFile('public/images/certs/google-ai-professional-certificate-opt.png');
  fs.renameSync('public/images/certs/google-ai-professional-certificate-opt.png', 'public/images/certs/google-ai-professional-certificate.png');

  // Optimize Anthropic Certificate
  await sharp('public/images/certs/AI-Fluency-Anthropic.jpg')
    .resize(600) // Display is larger on some views
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile('public/images/certs/AI-Fluency-Anthropic-opt.jpg');
  fs.renameSync('public/images/certs/AI-Fluency-Anthropic-opt.jpg', 'public/images/certs/AI-Fluency-Anthropic.jpg');

  console.log('Images optimized successfully');
}

optimize().catch(console.error);
