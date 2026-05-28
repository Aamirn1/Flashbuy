import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '../prisma/seed';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Cleaning existing database...\n');

  // Delete in correct order to respect foreign key constraints
  // Child tables first, then parent tables

  const deleteOrder = [
    'WalletTransaction',
    'Transaction',
    'Notification',
    'Referral',
    'Review',
    'Ticket',
    'Payment',
    'OrderItem',
    'Order',
    'Coupon',
    'Product',
    'Category',
    'SiteSetting',
    'User',
  ];

  for (const model of deleteOrder) {
    try {
      // @ts-expect-error - dynamic model access
      const count = await prisma[model].deleteMany();
      console.log(`  🗑️  Cleared ${model}: ${count.count} records`);
    } catch (e) {
      console.log(`  ⚠️  Skipped ${model}: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  }

  console.log('\n  ✅ Database cleaned\n');
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  🚀 Flash Buy - Database Seed Script');
  console.log('═══════════════════════════════════════\n');

  // Step 1: Clean existing data
  await cleanDatabase();

  // Step 2: Seed the database
  await seedDatabase();

  console.log('✨ All done! Your database is ready for development.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
