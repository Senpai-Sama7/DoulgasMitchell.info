const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testLogin() {
  const admin = await prisma.adminUser.findUnique({
    where: { username: 'admin' }
  });
  if (!admin) {
    throw new Error('Admin user not found');
  }
  
  const testPassword = process.env.ADMIN_PASSWORD;
  if (!testPassword) {
    throw new Error('ADMIN_PASSWORD must be set');
  }
  const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
  
  console.log('Password valid:', isValid);
  
  if (!isValid) {
    console.log('\n❌ Password does not match!');
    console.log('Resetting to ADMIN_PASSWORD from environment...');
    
    const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const newHash = await bcrypt.hash(testPassword, rounds);
    await prisma.adminUser.update({
      where: { username: 'admin' },
      data: { passwordHash: newHash }
    });
    
    console.log('✅ Password reset complete');
  }
  
  await prisma.$disconnect();
}

testLogin().catch(console.error);
