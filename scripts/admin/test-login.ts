import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function testLogin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    process.exit(1);
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email }
  });

  if (!admin || !admin.passwordHash) {
    console.log('❌ Admin user not found or has no password');
    await prisma.$disconnect();
    return;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (isValid) {
    console.log(`✅ Login successful for ${email}`);
  } else {
    console.log(`❌ Login failed for ${email}`);
  }

  await prisma.$disconnect();
}

testLogin().catch(console.error);
