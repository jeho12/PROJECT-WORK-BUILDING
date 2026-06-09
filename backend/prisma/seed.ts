import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@anchorsiwes.edu.ng' },
  });

  if (existingAdmin) {
    console.log('System Administrator already exists. Skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@2025!', 12);

  await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@anchorsiwes.edu.ng',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Seeding completed successfully. Default admin: admin@anchorsiwes.edu.ng / Admin@2025!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
