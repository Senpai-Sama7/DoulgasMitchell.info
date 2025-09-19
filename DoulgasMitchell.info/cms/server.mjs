import express from 'express';
import payload from 'payload';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info('✅ Payload CMS initialized');
    },
  });

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    payload.logger.info(`🟢 CMS listening on ${port}`);
  });
};

start().catch(err => {
  console.error('Payload init error:', err);
  process.exit(1);
});
