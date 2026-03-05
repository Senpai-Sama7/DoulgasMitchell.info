const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD must be set');
  }
  const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const passwordHash = await bcrypt.hash(password, rounds);
  
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
  
  await prisma.$disconnect();
}

resetAdmin().catch(console.error);
