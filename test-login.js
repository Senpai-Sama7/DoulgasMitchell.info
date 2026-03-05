const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testLogin() {
  const admin = await prisma.adminUser.findUnique({
    where: { username: 'admin' }
  });
  
  const testPassword = 'senpai2024';
  const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
  
  console.log('Testing password:', testPassword);
  console.log('Password valid:', isValid);
  
  if (!isValid) {
    console.log('\n❌ Password does not match!');
    console.log('Resetting to senpai2024...');
    
    const newHash = await bcrypt.hash(testPassword, 10);
    await prisma.adminUser.update({
      where: { username: 'admin' },
      data: { passwordHash: newHash }
    });
    
    console.log('✅ Password reset complete');
  }
  
  await prisma.$disconnect();
}

testLogin().catch(console.error);
