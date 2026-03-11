import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdmin() {
  const admin = await prisma.adminUser.findFirst({
    where: { role: 'admin' }
  });
  
  if (admin) {
    console.log('✅ Admin user exists');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Password hash set:', !!admin.passwordHash);
  } else {
    console.log('❌ No admin user found');
  }
  
  await prisma.$disconnect();
}

checkAdmin().catch(console.error);
