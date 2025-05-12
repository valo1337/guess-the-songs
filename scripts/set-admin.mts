import { PrismaClient } from '@prisma/client';

async function setAdminStatus(email: string, isAdmin: boolean) {
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { 
        // @ts-ignore
        isAdmin 
      }
    });

    console.log(`User ${email} admin status set to: ${isAdmin}`);
  } catch (error) {
    console.error('Error setting admin status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Immediately invoked async function to use top-level await
(async () => {
  // Usage: ts-node scripts/set-admin.mts admin@example.com true
  const email = process.argv[2];
  const isAdmin = process.argv[3] === 'true';

  if (!email) {
    console.error('Please provide an email');
    process.exit(1);
  }

  await setAdminStatus(email, isAdmin);
})();
