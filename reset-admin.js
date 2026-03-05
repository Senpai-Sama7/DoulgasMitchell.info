const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdmin() {
  const password = 'senpai2024';
  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.adminUser.deleteMany({
    where: { username: 'admin' }
  });
  
  await prisma.adminUser.create({
    data: {
      username: 'admin',
      passwordHash,
      email: 'admin@senpai-isekai.com',
    }
  });
  
  console.log('✅ Admin user reset successfully');
  console.log('Username: admin');
  console.log('Password: senpai2024');
  
  await prisma.$disconnect();
}

resetAdmin().catch(console.error);
