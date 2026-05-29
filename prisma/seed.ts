import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to generate a slug from a name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Cryptographically secure random code generator
function generateSecureCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(length);
  crypto.randomFillSync(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(array[i] % chars.length);
  }
  return result;
}

function generateDeliveryCode(): string {
  return `${generateSecureCode(4)}-${generateSecureCode(4)}-${generateSecureCode(4)}`;
}

function generateReferralCode(): string {
  return generateSecureCode(8);
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Starting production database seeding...\n');

  // ==========================================
  // 1. CREATE ADMIN USER (with bcrypt)
  // ==========================================
  console.log('📝 Creating admin user...');

  const adminPassword = await bcrypt.hash('FlashBuy@2024!Admin', SALT_ROUNDS);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@flashbuy.com',
      name: 'Flash Buy Admin',
      password: adminPassword,
      role: 'admin',
      referralCode: 'FLASHADM1',
      isVerified: true,
      balance: 0,
    },
  });
  console.log(`  ✅ Admin created: ${adminUser.email}`);
  console.log(`  🔑 Admin password: FlashBuy@2024!Admin\n`);

  // ==========================================
  // 2. CREATE CATEGORIES
  // ==========================================
  console.log('📝 Creating categories...');

  const [flashUsdtCat] = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Flash USDT',
        slug: 'flash-usdt',
        description: 'Instant USDT transfers at discounted rates. Fast, secure, and reliable.',
        icon: 'Zap',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gift Cards',
        slug: 'gift-cards',
        description: 'Digital gift cards for popular stores and services worldwide.',
        icon: 'Gift',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Software Keys',
        slug: 'software-keys',
        description: 'Genuine software license keys for operating systems, office suites, and more.',
        icon: 'Key',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gaming Accounts',
        slug: 'gaming-accounts',
        description: 'Pre-loaded gaming accounts with rare items and high levels.',
        icon: 'Gamepad2',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'VPN & Proxy',
        slug: 'vpn-proxy',
        description: 'Premium VPN and proxy subscriptions for secure browsing and privacy.',
        icon: 'Shield',
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Digital Courses',
        slug: 'digital-courses',
        description: 'Online courses and bootcamps for skill development and career growth.',
        icon: 'GraduationCap',
        sortOrder: 6,
      },
    }),
  ]);
  console.log('  ✅ Created 6 categories\n');

  // ==========================================
  // 3. CREATE FLASH USDT BASE PRODUCT
  // This is required by the order API for foreign key
  // ==========================================
  console.log('📝 Creating Flash USDT base product...');

  const flashUsdtProduct = await prisma.product.create({
    data: {
      name: 'Flash USDT',
      slug: 'flash-usdt',
      description: 'Purchase Flash USDT at $0.01 per unit. Minimum order 1000 Flash USDT for $10. Instant delivery via TRC20 network. Fast, secure, and reliable transfers at unbeatable rates.',
      shortDesc: 'Flash USDT - $0.01 per unit, instant TRC20 transfer',
      images: [],
      price: 0.01,
      comparePrice: 0.01,
      sku: 'FUSDT-UNIT',
      categoryId: flashUsdtCat.id,
      stock: 999999,
      deliveryType: 'automatic',
      deliveryInfo: {
        instructions: 'Flash USDT will be sent to your TRC20 wallet within minutes of purchase.',
        network: 'TRC20',
      },
      isFeatured: true,
      isNew: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 500,
      soldCount: 1000,
    },
  });
  console.log(`  ✅ Created Flash USDT product: ${flashUsdtProduct.id}\n`);

  // ==========================================
  // 4. CREATE COUPONS
  // ==========================================
  console.log('📝 Creating coupons...');

  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrder: 0,
        maxDiscount: 50,
        usageLimit: 1000,
        usedCount: 0,
        userLimit: 1,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'FLASH20',
        type: 'percentage',
        value: 20,
        minOrder: 100,
        usageLimit: 500,
        usedCount: 0,
        userLimit: 2,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'SAVE5',
        type: 'fixed',
        value: 5,
        minOrder: 25,
        usageLimit: 2000,
        usedCount: 0,
        userLimit: 3,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
  console.log(`  ✅ Created ${coupons.length} coupons\n`);

  // ==========================================
  // 5. CREATE SITE SETTINGS
  // ==========================================
  console.log('📝 Creating site settings...');

  const siteSettings = [
    { key: 'site_name', value: 'Flash Buy' },
    { key: 'site_description', value: 'Your trusted crypto eCommerce platform for digital products' },
    { key: 'usdt_trc20_wallet', value: 'TJmEeKWm7qYb3LHsRrGmN3vYfVdGhWkRtY' },
    { key: 'usdt_bep20_wallet', value: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38' },
    { key: 'min_deposit', value: '10' },
    { key: 'max_deposit', value: '10000' },
    { key: 'referral_commission_rate', value: '2' },
    { key: 'platform_fee_rate', value: '1' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'max_flash_usdt_per_order', value: '10000000' },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.create({ data: setting });
  }
  console.log(`  ✅ Created ${siteSettings.length} site settings\n`);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('═══════════════════════════════════════');
  console.log('  🎉 Production database seeding completed!');
  console.log('═══════════════════════════════════════');
  console.log(`  Admin User:     admin@flashbuy.com`);
  console.log(`  Admin Password: FlashBuy@2024!Admin`);
  console.log(`  Categories:     6`);
  console.log(`  Products:       1 (Flash USDT base)`);
  console.log(`  Coupons:        ${coupons.length}`);
  console.log(`  Site Settings:  ${siteSettings.length}`);
  console.log('═══════════════════════════════════════\n');
  console.log('⚠️  IMPORTANT: Change the admin password after first login!');
  console.log('⚠️  IMPORTANT: Update wallet addresses in Site Settings before going live!');
}

export { main as seedDatabase };
