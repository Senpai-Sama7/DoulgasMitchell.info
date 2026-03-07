#!/usr/bin/env node
import { randomBytes } from 'crypto';

function generateSecret(length = 32) {
  return randomBytes(length).toString('hex');
}

console.log('🔐 Secret Generator\n');
console.log('JWT_SECRET=' + generateSecret(32));
console.log('\nCopy this to your .env.local file');
console.log('Then restart your application and invalidate all sessions');
