import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function resetAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: 'admin' },
    create: {
      email,
      name: email.split('@')[0],
      passwordHash,
      role: 'admin',
    },
  });

  console.log(`✅ Admin user reset for ${admin.email}`);
  await prisma.$disconnect();
}

resetAdmin()
  .catch((err) => {
    console.error('❌ Admin reset failed:', err);
    process.exit(1);
  });
