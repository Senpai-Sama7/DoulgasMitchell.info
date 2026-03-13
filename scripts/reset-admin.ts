import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'DouglasMitchell@ReliantAI.org';
  const password = 'Pride-sama7+';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash },
    create: {
      email: email.toLowerCase(),
      name: 'Douglas Mitchell',
      passwordHash,
    },
  });

  console.log('Admin user updated with new password.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });