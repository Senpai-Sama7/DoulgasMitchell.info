import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'DouglasMitchell@ReliantAI.org';
  const password = 'Pride-sama7+';

  console.log('--- Admin Diagnostic ---');
  
  try {
    const adminCount = await prisma.adminUser.count();
    console.log(`Total Admin Users: ${adminCount}`);
    
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        passwordHash: true,
      }
    });
    
    console.log('\nUsers Found:');
    for (const user of users) {
      const isMatch = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
      console.log(`- Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Password Match (Pride-sama7+): ${isMatch ? '✅ YES' : '❌ NO'}`);
      if (!user.passwordHash) {
        console.log('  ❌ NO PASSWORD HASH FOUND FOR THIS USER');
      }
    }

  } catch (error: any) {
    if (error.code === 'P2021') {
      console.error('❌ AdminUser table does not exist in the database.');
    } else {
      console.error('❌ Error querying database:', error.message);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
