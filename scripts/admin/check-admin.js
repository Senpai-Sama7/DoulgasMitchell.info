const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  const admin = await prisma.adminUser.findUnique({
    where: { username: 'admin' }
  });
  
  if (admin) {
    console.log('✅ Admin user exists');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password hash:', admin.passwordHash.substring(0, 20) + '...');
  } else {
    console.log('❌ No admin user found');
  }
  
  await prisma.$disconnect();
}

checkAdmin().catch(console.error);
