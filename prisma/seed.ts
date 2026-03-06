import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.journalTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.passkeyCredential.deleteMany();
  await prisma.session.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.requestLog.deleteMany();

  // Create admin user
  console.log("Creating admin user...");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is required for security reasons to set a strong admin password during seeding.");
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.create({
    data: {
      username: "admin",
      passwordHash,
      email: "admin@douglasmitchell.info",
    },
  });

  // Create empty settings
  console.log("Creating settings...");
  await prisma.settings.create({
    data: {
      siteTitle: "Douglas Mitchell",
      siteDescription:
        "A personal portfolio exploring architecture, technology, and creative expression",
      linkedin: "https://linkedin.com/in/douglasmitchell",
      github: "https://github.com/douglasmitchell",
    },
  });

  // Create initial activity log
  console.log("Creating activity log...");
  await prisma.activityLog.create({
    data: {
      action: "create",
      resource: "system",
      details: "Database initialized with empty portfolio",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
