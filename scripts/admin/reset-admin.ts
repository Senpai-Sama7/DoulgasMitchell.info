import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function resetAdmin() {
  const email = process.env.ADMIN_EMAIL || 'DouglasMitchell@ReliantAI.org';
  const password = process.env.ADMIN_PASSWORD || 'newpassword123';
  
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: 'admin' },
    create: {
      email,
      name: 'System Admin',
      passwordHash,
      role: 'admin',
    }
  });

  console.log(`✅ Admin user reset for ${admin.email}`);
  await prisma.$disconnect();
}

resetAdmin().catch(console.error);
