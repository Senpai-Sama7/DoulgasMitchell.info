#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';

const execAsync = promisify(exec);

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  
  await mkdir('backups', { recursive: true });
  
  console.log('📦 Starting backup...');
  
  // Backup database
  try {
    const dbUrl = process.env.DATABASE_URL_UNPOOLED;
    if (dbUrl) {
      await execAsync(`pg_dump "${dbUrl}" > backups/db-${timestamp}.sql`);
      console.log('✓ Database backed up');
    }
  } catch (error) {
    console.error('✗ Database backup failed:', error);
  }
  
  // Backup uploads
  try {
    await execAsync(`tar -czf backups/uploads-${timestamp}.tar.gz public/uploads`);
    console.log('✓ Uploads backed up');
  } catch (error) {
    console.error('✗ Uploads backup failed:', error);
  }
  
  // Clean old backups (keep last 30 days)
  try {
    await execAsync('find backups -name "*.sql" -mtime +30 -delete 2>/dev/null || true');
    await execAsync('find backups -name "*.tar.gz" -mtime +30 -delete 2>/dev/null || true');
    console.log('✓ Old backups cleaned');
  } catch (error) {
    console.error('✗ Cleanup failed:', error);
  }
  
  console.log('\n✅ Backup complete!');
}

backup().catch(console.error);
