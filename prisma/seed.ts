import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate a slug from a name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper to generate a random alphanumeric code
function generateCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to generate a random string for delivery info
function generateDeliveryCode(): string {
  return `${generateCode(4)}-${generateCode(4)}-${generateCode(4)}`;
}

// Helper for random number in range
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper for random float in range
function randFloat(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ==========================================
  // 1. CREATE USERS
  // ==========================================
  console.log('📝 Creating users...');

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@flashbuy.com',
        name: 'Admin User',
        password: Buffer.from('admin123').toString('base64'),
        role: 'admin',
        referralCode: 'ADMIN001',
        isVerified: true,
        balance: 0,
      },
    }),
    prisma.user.create({
      data: {
        email: 'support@flashbuy.com',
        name: 'Support Agent',
        password: Buffer.from('support123').toString('base64'),
        role: 'support',
        referralCode: 'SUPPORT01',
        isVerified: true,
        balance: 0,
      },
    }),
    prisma.user.create({
      data: {
        email: 'john@example.com',
        name: 'John Doe',
        password: Buffer.from('john123').toString('base64'),
        role: 'customer',
        referralCode: 'JOHN001',
        isVerified: true,
        balance: 500,
        country: 'United States',
        phone: '+1234567890',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah@example.com',
        name: 'Sarah Smith',
        password: Buffer.from('sarah123').toString('base64'),
        role: 'customer',
        referralCode: 'SARA0001',
        isVerified: true,
        balance: 250,
        country: 'United Kingdom',
        phone: '+44123456789',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike@example.com',
        name: 'Mike Johnson',
        password: Buffer.from('mike123').toString('base64'),
        role: 'customer',
        referralCode: 'MIKE0001',
        isVerified: true,
        balance: 100,
        country: 'Canada',
      },
    }),
  ]);

  const [adminUser, supportUser, johnUser, sarahUser, mikeUser] = users;
  console.log(`  ✅ Created ${users.length} users\n`);

  // ==========================================
  // 2. CREATE CATEGORIES
  // ==========================================
  console.log('📝 Creating categories...');

  const categories = await Promise.all([
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

  const [flashUsdtCat, giftCardsCat, softwareKeysCat, gamingAccountsCat, vpnProxyCat, digitalCoursesCat] = categories;
  console.log(`  ✅ Created ${categories.length} categories\n`);

  // ==========================================
  // 3. CREATE PRODUCTS
  // ==========================================
  console.log('📝 Creating products...');

  const productDefs = [
    // Flash USDT
    {
      name: '100 Flash USDT',
      price: 98.5,
      comparePrice: 100.0,
      sku: 'FUSDT-100',
      categoryId: flashUsdtCat.id,
      stock: 500,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Transfer will be sent to your TRC20 wallet within 5 minutes of purchase.',
        network: 'TRC20',
        amount: '100 USDT',
      }),
      isFeatured: true,
      isNew: false,
      isTrending: true,
      rating: 4.8,
      reviewCount: 156,
      soldCount: 423,
      shortDesc: '100 USDT instant transfer via TRC20 network',
      description: 'Get 100 USDT instantly transferred to your TRC20 wallet. Our Flash USDT service ensures fast, secure, and reliable transfers at a discounted rate. Perfect for quick transactions and trading. Delivery is automatic and typically completes within 5 minutes.',
    },
    {
      name: '500 Flash USDT',
      price: 485.0,
      comparePrice: 500.0,
      sku: 'FUSDT-500',
      categoryId: flashUsdtCat.id,
      stock: 300,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Transfer will be sent to your TRC20 wallet within 5 minutes of purchase.',
        network: 'TRC20',
        amount: '500 USDT',
      }),
      isFeatured: true,
      isNew: false,
      isTrending: true,
      rating: 4.9,
      reviewCount: 89,
      soldCount: 267,
      shortDesc: '500 USDT instant transfer via TRC20 network',
      description: 'Get 500 USDT instantly transferred to your TRC20 wallet. Best value for medium-sized transactions. Our Flash USDT service guarantees fast and secure delivery. Save 3% compared to market rate.',
    },
    {
      name: '1000 Flash USDT',
      price: 960.0,
      comparePrice: 1000.0,
      sku: 'FUSDT-1000',
      categoryId: flashUsdtCat.id,
      stock: 200,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Transfer will be sent to your TRC20 wallet within 5 minutes of purchase.',
        network: 'TRC20',
        amount: '1000 USDT',
      }),
      isFeatured: true,
      isNew: true,
      isTrending: true,
      rating: 4.7,
      reviewCount: 45,
      soldCount: 134,
      shortDesc: '1000 USDT instant transfer - best value',
      description: 'Get 1000 USDT instantly transferred to your TRC20 wallet. Our premium Flash USDT service offers the best rates for large transfers. Save 4% compared to market rate. Automatic delivery within minutes.',
    },
    {
      name: '5000 Flash USDT',
      price: 4750.0,
      comparePrice: 5000.0,
      sku: 'FUSDT-5000',
      categoryId: flashUsdtCat.id,
      stock: 50,
      deliveryType: 'manual',
      deliveryInfo: JSON.stringify({
        instructions: 'Large transfers may take up to 30 minutes for security verification. Our team will contact you via email.',
        network: 'TRC20/BEP20',
        amount: '5000 USDT',
      }),
      isFeatured: false,
      isNew: true,
      isTrending: false,
      rating: 4.6,
      reviewCount: 12,
      soldCount: 28,
      shortDesc: '5000 USDT bulk transfer - premium service',
      description: 'Bulk 5000 USDT transfer with premium service. Save 5% compared to market rate. Manual delivery for added security with verification. Supports both TRC20 and BEP20 networks.',
    },

    // Gift Cards
    {
      name: 'Amazon Gift Card $50',
      price: 46.5,
      comparePrice: 50.0,
      sku: 'GC-AMZ-50',
      categoryId: giftCardsCat.id,
      stock: 400,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Redeem at amazon.com/gc/redeem or enter at checkout.',
        region: 'Global',
      }),
      isFeatured: true,
      isNew: false,
      isTrending: true,
      rating: 4.9,
      reviewCount: 198,
      soldCount: 487,
      shortDesc: 'Amazon $50 gift card - instant delivery',
      description: 'Get a $50 Amazon gift card delivered instantly to your email. Valid on Amazon.com for millions of items. Never expires. Perfect for personal use or as a gift. Automatic delivery with redeem code.',
    },
    {
      name: 'Netflix Gift Card $30',
      price: 27.0,
      comparePrice: 30.0,
      sku: 'GC-NFX-30',
      categoryId: giftCardsCat.id,
      stock: 350,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Redeem at netflix.com/gift or enter in your Netflix account settings.',
        region: 'Global',
      }),
      isFeatured: false,
      isNew: false,
      isTrending: true,
      rating: 4.7,
      reviewCount: 134,
      soldCount: 356,
      shortDesc: 'Netflix $30 gift card for streaming credit',
      description: 'Enjoy your favorite shows with a $30 Netflix gift card. Adds credit to your Netflix subscription. Works with all Netflix plans. Instant automatic delivery.',
    },
    {
      name: 'Steam Gift Card $100',
      price: 92.0,
      comparePrice: 100.0,
      sku: 'GC-STM-100',
      categoryId: giftCardsCat.id,
      stock: 250,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Redeem at store.steampowered.com/account/redeemwalletcode',
        region: 'Global',
      }),
      isFeatured: true,
      isNew: false,
      isTrending: false,
      rating: 4.8,
      reviewCount: 167,
      soldCount: 412,
      shortDesc: 'Steam $100 wallet code for games and DLC',
      description: 'Get a $100 Steam gift card and buy the games you want. Works with all Steam purchases including games, DLC, and in-game items. Instant delivery of your redeem code.',
    },
    {
      name: 'Apple Gift Card $25',
      price: 23.5,
      comparePrice: 25.0,
      sku: 'GC-APL-25',
      categoryId: giftCardsCat.id,
      stock: 500,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Redeem in App Store or iTunes Store on your Apple device.',
        region: 'US',
      }),
      isFeatured: false,
      isNew: true,
      isTrending: false,
      rating: 4.6,
      reviewCount: 78,
      soldCount: 189,
      shortDesc: 'Apple $25 gift card for App Store & iTunes',
      description: 'Use this $25 Apple gift card for purchases on the App Store, iTunes Store, Apple Music, and more. Compatible with all Apple services. Instant delivery.',
    },
    {
      name: 'Google Play Gift Card $50',
      price: 46.0,
      comparePrice: 50.0,
      sku: 'GC-GPL-50',
      categoryId: giftCardsCat.id,
      stock: 300,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Redeem at play.google.com/redeem or in the Google Play app.',
        region: 'US',
      }),
      isFeatured: false,
      isNew: false,
      isTrending: false,
      rating: 4.5,
      reviewCount: 56,
      soldCount: 134,
      shortDesc: 'Google Play $50 gift card for apps & games',
      description: 'Get a $50 Google Play gift card for apps, games, movies, and more on the Google Play Store. Works with all Android devices. Automatic instant delivery.',
    },

    // Software Keys
    {
      name: 'Windows 11 Pro Key',
      price: 29.99,
      comparePrice: 199.99,
      sku: 'SW-W11P',
      categoryId: softwareKeysCat.id,
      stock: 200,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Enter the product key during Windows installation or in Settings > System > Activation.',
        type: 'OEM Key',
      }),
      isFeatured: true,
      isNew: false,
      isTrending: true,
      rating: 4.3,
      reviewCount: 89,
      soldCount: 234,
      shortDesc: 'Genuine Windows 11 Professional activation key',
      description: 'Get a genuine Windows 11 Pro activation key at a fraction of the retail price. OEM key valid for one installation. Includes all Pro features like BitLocker, Remote Desktop, and Hyper-V. Instant delivery.',
    },
    {
      name: 'Office 365 Personal Key',
      price: 39.99,
      comparePrice: 69.99,
      sku: 'SW-O365P',
      categoryId: softwareKeysCat.id,
      stock: 150,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Redeem at office.com/setup with your Microsoft account.',
        type: '1 Year Subscription',
      }),
      isFeatured: true,
      isNew: true,
      isTrending: false,
      rating: 4.5,
      reviewCount: 67,
      soldCount: 178,
      shortDesc: 'Microsoft Office 365 Personal 1-year subscription',
      description: 'Microsoft Office 365 Personal key for 1 year. Includes Word, Excel, PowerPoint, Outlook, and 1TB OneDrive storage. Works on 1 PC/Mac + 1 tablet. Instant delivery of activation key.',
    },
    {
      name: 'Adobe Creative Cloud Key',
      price: 89.99,
      comparePrice: 129.99,
      sku: 'SW-ADCC',
      categoryId: softwareKeysCat.id,
      stock: 75,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Redeem at creative.adobe.com/redeem with your Adobe ID.',
        type: '1 Year Subscription',
      }),
      isFeatured: false,
      isNew: true,
      isTrending: true,
      rating: 4.4,
      reviewCount: 34,
      soldCount: 89,
      shortDesc: 'Adobe Creative Cloud All Apps 1-year plan',
      description: 'Adobe Creative Cloud All Apps plan for 1 year. Includes Photoshop, Illustrator, Premiere Pro, After Effects, and 20+ more creative apps. Plus 100GB cloud storage. Instant key delivery.',
    },
    {
      name: 'Norton 360 Deluxe Key',
      price: 19.99,
      comparePrice: 49.99,
      sku: 'SW-N360D',
      categoryId: softwareKeysCat.id,
      stock: 300,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Download from norton.com/setup and enter your product key.',
        type: '1 Year / 3 Devices',
      }),
      isFeatured: false,
      isNew: false,
      isTrending: false,
      rating: 4.1,
      reviewCount: 45,
      soldCount: 123,
      shortDesc: 'Norton 360 Deluxe - 1 year, 3 devices',
      description: 'Norton 360 Deluxe antivirus protection for 3 devices. Includes real-time threat protection, secure VPN, password manager, and 50GB cloud backup. 1-year subscription. Instant delivery.',
    },

    // Gaming Accounts
    {
      name: 'Fortnite Account - Renegade Raider',
      price: 149.99,
      comparePrice: 199.99,
      sku: 'GA-FN-RR',
      categoryId: gamingAccountsCat.id,
      stock: 15,
      deliveryType: 'manual',
      deliveryInfo: JSON.stringify({
        instructions: 'Account credentials will be sent to your email within 24 hours. Please change the password immediately after login.',
        includes: 'Renegade Raider skin, 50+ skins, 200+ V-Bucks',
        level: 'Level 200+',
      }),
      isFeatured: true,
      isNew: false,
      isTrending: true,
      rating: 4.2,
      reviewCount: 23,
      soldCount: 56,
      shortDesc: 'Fortnite account with rare Renegade Raider skin',
      description: 'Rare Fortnite account featuring the coveted Renegade Raider skin. Includes 50+ additional skins, 200+ V-Bucks, and Level 200+ battle pass progress. Manual delivery for account security.',
    },
    {
      name: 'Valorant Account - Immortal Rank',
      price: 79.99,
      comparePrice: 99.99,
      sku: 'GA-VAL-IMM',
      categoryId: gamingAccountsCat.id,
      stock: 25,
      deliveryType: 'manual',
      deliveryInfo: JSON.stringify({
        instructions: 'Account credentials will be sent to your email within 24 hours. Please change the password immediately after login.',
        includes: 'Immortal rank, 30+ weapon skins, Battle Pass completed',
        rank: 'Immortal 2',
      }),
      isFeatured: false,
      isNew: false,
      isTrending: false,
      rating: 4.0,
      reviewCount: 18,
      soldCount: 42,
      shortDesc: 'Valorant account at Immortal rank with skins',
      description: 'Valorant account ranked at Immortal 2. Includes 30+ premium weapon skins, completed Battle Pass, and exclusive agent unlocks. Perfect for players who want to skip the grind.',
    },
    {
      name: 'Minecraft Premium Account',
      price: 14.99,
      comparePrice: 26.99,
      sku: 'GA-MC-PREM',
      categoryId: gamingAccountsCat.id,
      stock: 100,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Login to minecraft.net with the provided credentials. Change password and email immediately.',
        type: 'Java Edition',
      }),
      isFeatured: false,
      isNew: false,
      isTrending: false,
      rating: 4.6,
      reviewCount: 87,
      soldCount: 234,
      shortDesc: 'Minecraft Java Edition premium account',
      description: 'Minecraft Java Edition premium account. Full access to all servers, skins, and updates. Includes migration to Microsoft account. Automatic delivery of credentials.',
    },

    // VPN & Proxy
    {
      name: 'ExpressVPN 1 Year Subscription',
      price: 59.99,
      comparePrice: 99.95,
      sku: 'VPN-EXP-1Y',
      categoryId: vpnProxyCat.id,
      stock: 250,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Download ExpressVPN from expressvpn.com and activate with the provided activation code.',
        type: '1 Year Subscription',
        devices: '8 simultaneous connections',
      }),
      isFeatured: true,
      isNew: false,
      isTrending: true,
      rating: 4.7,
      reviewCount: 112,
      soldCount: 289,
      shortDesc: 'ExpressVPN 1-year plan - save 40%',
      description: 'ExpressVPN 1-year subscription at 40% off. Ultra-fast servers in 94 countries, unlimited bandwidth, and military-grade encryption. Works on all devices with 8 simultaneous connections. Instant activation code delivery.',
    },
    {
      name: 'NordVPN 2 Year Subscription',
      price: 69.99,
      comparePrice: 119.76,
      sku: 'VPN-NRD-2Y',
      categoryId: vpnProxyCat.id,
      stock: 200,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Download NordVPN from nordvpn.com and login with the provided credentials.',
        type: '2 Year Subscription',
        devices: '6 simultaneous connections',
      }),
      isFeatured: false,
      isNew: true,
      isTrending: false,
      rating: 4.5,
      reviewCount: 78,
      soldCount: 167,
      shortDesc: 'NordVPN 2-year plan - best value',
      description: 'NordVPN 2-year subscription at the best price. 5,500+ servers in 60 countries, Threat Protection, and Double VPN for extra security. 6 simultaneous connections. Instant delivery.',
    },
    {
      name: 'Private Internet Access VPN',
      price: 39.99,
      comparePrice: 69.95,
      sku: 'VPN-PIA-1Y',
      categoryId: vpnProxyCat.id,
      stock: 180,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Download PIA VPN from privateinternetaccess.com and activate with the provided key.',
        type: '1 Year Subscription',
        devices: 'Unlimited simultaneous connections',
      }),
      isFeatured: false,
      isNew: false,
      isTrending: false,
      rating: 4.3,
      reviewCount: 45,
      soldCount: 98,
      shortDesc: 'PIA VPN 1-year subscription - unlimited devices',
      description: 'Private Internet Access VPN 1-year plan with unlimited simultaneous device connections. 35,000+ servers in 84 countries, ad & tracker blocking, and proven no-logs policy. Great value for families.',
    },

    // Digital Courses
    {
      name: 'Python Masterclass 2024',
      price: 24.99,
      comparePrice: 49.99,
      sku: 'DC-PYT-24',
      categoryId: digitalCoursesCat.id,
      stock: 999,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Access the course at learn.flashbuy.com using the provided enrollment code.',
        type: 'Lifetime Access',
        includes: '50+ hours of video, 100+ exercises, certificate',
      }),
      isFeatured: true,
      isNew: true,
      isTrending: true,
      rating: 4.8,
      reviewCount: 145,
      soldCount: 389,
      shortDesc: 'Complete Python programming course - 50% off',
      description: 'Master Python programming from beginner to advanced. 50+ hours of video content, 100+ coding exercises, real-world projects, and a completion certificate. Lifetime access with free updates. Perfect for beginners and intermediate developers.',
    },
    {
      name: 'Web Development Bootcamp',
      price: 34.99,
      comparePrice: 69.99,
      sku: 'DC-WEB-BB',
      categoryId: digitalCoursesCat.id,
      stock: 999,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Access the course at learn.flashbuy.com using the provided enrollment code.',
        type: 'Lifetime Access',
        includes: '80+ hours of video, 20+ projects, certificate',
      }),
      isFeatured: true,
      isNew: false,
      isTrending: false,
      rating: 4.6,
      reviewCount: 98,
      soldCount: 267,
      shortDesc: 'Full-stack web development bootcamp',
      description: 'Learn full-stack web development from scratch. Covers HTML, CSS, JavaScript, React, Node.js, and databases. 80+ hours of content, 20+ portfolio projects, and job-ready skills. Lifetime access.',
    },
    {
      name: 'Crypto Trading 101',
      price: 19.99,
      comparePrice: 39.99,
      sku: 'DC-CRP-101',
      categoryId: digitalCoursesCat.id,
      stock: 999,
      deliveryType: 'automatic',
      deliveryInfo: JSON.stringify({
        code: generateDeliveryCode(),
        instructions: 'Access the course at learn.flashbuy.com using the provided enrollment code.',
        type: 'Lifetime Access',
        includes: '30+ hours of video, trading simulator access, community',
      }),
      isFeatured: false,
      isNew: true,
      isTrending: true,
      rating: 4.4,
      reviewCount: 56,
      soldCount: 134,
      shortDesc: 'Learn cryptocurrency trading strategies',
      description: 'Learn how to trade cryptocurrencies profitably. Covers technical analysis, risk management, trading strategies, and market psychology. 30+ hours of content plus access to our trading simulator and community.',
    },
  ];

  const products = [];
  for (const pDef of productDefs) {
    const product = await prisma.product.create({
      data: {
        name: pDef.name,
        slug: slugify(pDef.name),
        description: pDef.description,
        shortDesc: pDef.shortDesc,
        price: pDef.price,
        comparePrice: pDef.comparePrice,
        sku: pDef.sku,
        categoryId: pDef.categoryId,
        stock: pDef.stock,
        deliveryType: pDef.deliveryType,
        deliveryInfo: pDef.deliveryInfo,
        images: JSON.stringify(['/images/product-placeholder.png']),
        isFeatured: pDef.isFeatured,
        isNew: pDef.isNew,
        isTrending: pDef.isTrending,
        rating: pDef.rating,
        reviewCount: pDef.reviewCount,
        soldCount: pDef.soldCount,
      },
    });
    products.push(product);
  }

  console.log(`  ✅ Created ${products.length} products\n`);

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
        usedCount: 234,
        userLimit: 1,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'FLASH20',
        type: 'percentage',
        value: 20,
        minOrder: 100,
        maxDiscount: null,
        usageLimit: 500,
        usedCount: 67,
        userLimit: 2,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'SAVE5',
        type: 'fixed',
        value: 5,
        minOrder: 25,
        maxDiscount: null,
        usageLimit: 2000,
        usedCount: 456,
        userLimit: 3,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      },
    }),
  ]);

  console.log(`  ✅ Created ${coupons.length} coupons\n`);

  // ==========================================
  // 5. CREATE ORDDS
  // ==========================================
  console.log('📝 Creating orders...');

  const orderData = [
    {
      user: johnUser,
      status: 'completed',
      paymentStatus: 'confirmed',
      deliveryStatus: 'delivered',
      paymentMethod: 'usdt_trc20',
      items: [
        { product: products[0], quantity: 1 },  // 100 Flash USDT
        { product: products[4], quantity: 1 },  // Amazon Gift Card $50
      ],
      discount: 9.85,
      couponId: coupons[0].id,
      daysAgo: 15,
    },
    {
      user: johnUser,
      status: 'completed',
      paymentStatus: 'confirmed',
      deliveryStatus: 'delivered',
      paymentMethod: 'usdt_bep20',
      items: [
        { product: products[10], quantity: 1 }, // Windows 11 Pro Key
      ],
      discount: 0,
      couponId: null,
      daysAgo: 10,
    },
    {
      user: sarahUser,
      status: 'completed',
      paymentStatus: 'confirmed',
      deliveryStatus: 'delivered',
      paymentMethod: 'usdt_trc20',
      items: [
        { product: products[6], quantity: 1 },  // Steam Gift Card $100
        { product: products[8], quantity: 1 },  // Apple Gift Card $25
      ],
      discount: 5,
      couponId: coupons[2].id,
      daysAgo: 8,
    },
    {
      user: sarahUser,
      status: 'processing',
      paymentStatus: 'confirmed',
      deliveryStatus: 'pending',
      paymentMethod: 'usdt_trc20',
      items: [
        { product: products[13], quantity: 1 }, // Fortnite Account
      ],
      discount: 0,
      couponId: null,
      daysAgo: 2,
    },
    {
      user: mikeUser,
      status: 'paid',
      paymentStatus: 'confirmed',
      deliveryStatus: 'pending',
      paymentMethod: 'usdt_bep20',
      items: [
        { product: products[2], quantity: 1 },  // 1000 Flash USDT
      ],
      discount: 0,
      couponId: null,
      daysAgo: 1,
    },
    {
      user: mikeUser,
      status: 'completed',
      paymentStatus: 'confirmed',
      deliveryStatus: 'delivered',
      paymentMethod: 'usdt_trc20',
      items: [
        { product: products[16], quantity: 1 }, // ExpressVPN 1 Year
      ],
      discount: 0,
      couponId: null,
      daysAgo: 20,
    },
    {
      user: johnUser,
      status: 'cancelled',
      paymentStatus: 'refunded',
      deliveryStatus: 'pending',
      paymentMethod: null,
      items: [
        { product: products[1], quantity: 1 },  // 500 Flash USDT
      ],
      discount: 0,
      couponId: null,
      daysAgo: 25,
    },
    {
      user: sarahUser,
      status: 'completed',
      paymentStatus: 'confirmed',
      deliveryStatus: 'delivered',
      paymentMethod: 'usdt_trc20',
      items: [
        { product: products[19], quantity: 1 }, // Python Masterclass
        { product: products[20], quantity: 1 }, // Web Dev Bootcamp
      ],
      discount: 11.99,
      couponId: coupons[0].id,
      daysAgo: 5,
    },
    {
      user: mikeUser,
      status: 'payment_waiting',
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      paymentMethod: 'usdt_trc20',
      items: [
        { product: products[5], quantity: 1 },  // Netflix Gift Card $30
        { product: products[9], quantity: 1 },  // Google Play Gift Card $50
      ],
      discount: 0,
      couponId: null,
      daysAgo: 0,
    },
    {
      user: johnUser,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      paymentMethod: null,
      items: [
        { product: products[16], quantity: 1 }, // Minecraft Premium
      ],
      discount: 0,
      couponId: null,
      daysAgo: 0,
    },
  ];

  const orders = [];
  for (let i = 0; i < orderData.length; i++) {
    const o = orderData[i];
    const itemsPrice = o.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const fee = parseFloat((itemsPrice * 0.01).toFixed(2)); // 1% fee
    const total = parseFloat((itemsPrice - o.discount + fee).toFixed(2));

    const createdAt = new Date(Date.now() - o.daysAgo * 24 * 60 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        orderNumber: `FB-${String(10001 + i)}`,
        userId: o.user.id,
        status: o.status,
        itemsPrice: parseFloat(itemsPrice.toFixed(2)),
        discount: o.discount,
        fee,
        total,
        couponId: o.couponId,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        deliveryStatus: o.deliveryStatus,
        createdAt,
        items: {
          create: o.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            total: parseFloat((item.product.price * item.quantity).toFixed(2)),
            deliveryData: o.deliveryStatus === 'delivered'
              ? JSON.stringify({
                  code: generateDeliveryCode(),
                  deliveredAt: new Date(createdAt.getTime() + 5 * 60 * 1000).toISOString(),
                })
              : null,
          })),
        },
      },
    });

    // Create payment record for paid orders
    if (o.paymentStatus === 'confirmed' && o.paymentMethod) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          userId: o.user.id,
          method: o.paymentMethod,
          amount: total,
          walletAddress: `T${generateCode(33)}`,
          txHash: `0x${generateCode(64).toLowerCase()}`,
          status: 'confirmed',
          confirmedAt: new Date(createdAt.getTime() + 10 * 60 * 1000),
          createdAt,
        },
      });
    }

    orders.push(order);
  }

  console.log(`  ✅ Created ${orders.length} orders with items and payments\n`);

  // ==========================================
  // 6. CREATE REVIEWS
  // ==========================================
  console.log('📝 Creating reviews...');

  const reviewData = [
    { user: johnUser, product: products[0], rating: 5, comment: 'Lightning fast delivery! Got my USDT in under 2 minutes. Great service!' },
    { user: johnUser, product: products[4], rating: 5, comment: 'Amazon gift card worked perfectly. Instant delivery, no issues at all.' },
    { user: sarahUser, product: products[6], rating: 4, comment: 'Steam card was delivered instantly. Good value for money.' },
    { user: sarahUser, product: products[10], rating: 5, comment: 'Windows 11 Pro key activated without any problems. Saved so much compared to retail!' },
    { user: mikeUser, product: products[16], rating: 4, comment: 'ExpressVPN subscription works great. Speed is good and the price was unbeatable.' },
    { user: mikeUser, product: products[2], rating: 5, comment: '1000 USDT delivered quickly. Will definitely buy again. Trustworthy platform!' },
    { user: johnUser, product: products[19], rating: 5, comment: 'Python course is comprehensive and well-structured. Highly recommended for beginners!' },
    { user: sarahUser, product: products[20], rating: 4, comment: 'Good web dev course. Covers a lot of ground but could use more advanced topics.' },
    { user: mikeUser, product: products[15], rating: 5, comment: 'Minecraft account works perfectly. Great deal compared to buying directly.' },
    { user: johnUser, product: products[11], rating: 3, comment: 'Office 365 key works but took a while to activate. Support helped resolve it though.' },
    { user: sarahUser, product: products[5], rating: 5, comment: 'Netflix gift card - simple and fast. No complaints at all!' },
    { user: mikeUser, product: products[21], rating: 4, comment: 'Crypto trading course is informative. Good for getting started with trading.' },
    { user: johnUser, product: products[17], rating: 4, comment: 'NordVPN works well. The 2-year deal is great value for money.' },
  ];

  const reviews = [];
  for (const r of reviewData) {
    const review = await prisma.review.create({
      data: {
        userId: r.user.id,
        productId: r.product.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000),
      },
    });
    reviews.push(review);
  }

  console.log(`  ✅ Created ${reviews.length} reviews\n`);

  // ==========================================
  // 7. CREATE NOTIFICATIONS
  // ==========================================
  console.log('📝 Creating notifications...');

  const notificationData = [
    {
      user: johnUser,
      title: 'Order Completed',
      message: 'Your order FB-10001 has been completed successfully. Your items have been delivered.',
      type: 'success',
      isRead: true,
    },
    {
      user: johnUser,
      title: 'Welcome to Flash Buy!',
      message: 'Welcome! Use code WELCOME10 for 10% off your first purchase.',
      type: 'info',
      isRead: true,
    },
    {
      user: sarahUser,
      title: 'Order Processing',
      message: 'Your order FB-10004 is being processed. You will receive your items shortly.',
      type: 'info',
      isRead: false,
    },
    {
      user: mikeUser,
      title: 'Payment Confirmed',
      message: 'Your payment for order FB-10005 has been confirmed. Processing your delivery now.',
      type: 'success',
      isRead: false,
    },
    {
      user: sarahUser,
      title: 'Special Offer!',
      message: 'Flash sale! Get 20% off all VPN subscriptions this weekend. Use code FLASH20.',
      type: 'warning',
      isRead: false,
    },
  ];

  const notifications = [];
  for (const n of notificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: n.user.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: new Date(Date.now() - rand(0, 7) * 24 * 60 * 60 * 1000),
      },
    });
    notifications.push(notification);
  }

  console.log(`  ✅ Created ${notifications.length} notifications\n`);

  // ==========================================
  // 8. CREATE REFERRALS
  // ==========================================
  console.log('📝 Creating referrals...');

  const referral1 = await prisma.referral.create({
    data: {
      referrerId: johnUser.id,
      referredId: mikeUser.id,
      commission: 5.0,
      status: 'active',
    },
  });

  const referral2 = await prisma.referral.create({
    data: {
      referrerId: sarahUser.id,
      referredId: johnUser.id,
      commission: 3.5,
      status: 'paid',
    },
  });

  console.log(`  ✅ Created 2 referrals\n`);

  // ==========================================
  // 9. CREATE TRANSACTIONS
  // ==========================================
  console.log('📝 Creating transactions...');

  const transactions = [
    { user: johnUser, type: 'deposit', amount: 500, description: 'USDT deposit via TRC20', status: 'completed' },
    { user: johnUser, type: 'purchase', amount: -145.15, description: 'Order FB-10001', status: 'completed' },
    { user: johnUser, type: 'purchase', amount: -29.99, description: 'Order FB-10002', status: 'completed' },
    { user: sarahUser, type: 'deposit', amount: 250, description: 'USDT deposit via TRC20', status: 'completed' },
    { user: sarahUser, type: 'purchase', amount: -109.5, description: 'Order FB-10003', status: 'completed' },
    { user: mikeUser, type: 'deposit', amount: 100, description: 'USDT deposit via BEP20', status: 'completed' },
    { user: mikeUser, type: 'commission', amount: 5.0, description: 'Referral commission from Mike', status: 'completed' },
    { user: johnUser, type: 'refund', amount: 485.0, description: 'Refund for cancelled order FB-10007', status: 'completed' },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({
      data: {
        userId: t.user.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        createdAt: new Date(Date.now() - rand(1, 20) * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`  ✅ Created ${transactions.length} transactions\n`);

  // ==========================================
  // 10. CREATE WALLET TRANSACTIONS
  // ==========================================
  console.log('📝 Creating wallet transactions...');

  const walletTransactions = [
    { user: johnUser, type: 'deposit', amount: 500, method: 'usdt_trc20', status: 'completed', txHash: `0x${generateCode(64).toLowerCase()}`, description: 'USDT deposit' },
    { user: sarahUser, type: 'deposit', amount: 250, method: 'usdt_trc20', status: 'completed', txHash: `0x${generateCode(64).toLowerCase()}`, description: 'USDT deposit' },
    { user: mikeUser, type: 'deposit', amount: 100, method: 'usdt_bep20', status: 'completed', txHash: `0x${generateCode(64).toLowerCase()}`, description: 'USDT deposit' },
  ];

  for (const wt of walletTransactions) {
    await prisma.walletTransaction.create({
      data: {
        userId: wt.user.id,
        type: wt.type,
        amount: wt.amount,
        method: wt.method,
        status: wt.status,
        txHash: wt.txHash,
        description: wt.description,
        createdAt: new Date(Date.now() - rand(1, 20) * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`  ✅ Created ${walletTransactions.length} wallet transactions\n`);

  // ==========================================
  // 11. CREATE TICKETS
  // ==========================================
  console.log('📝 Creating tickets...');

  const ticket1 = await prisma.ticket.create({
    data: {
      userId: johnUser.id,
      subject: 'Payment not confirmed',
      category: 'payment',
      description: 'I made a payment for my order but it still shows as pending. The transaction hash is 0xabc123. Please check and confirm.',
      status: 'solved',
      priority: 'high',
      messages: JSON.stringify([
        { sender: 'customer', message: 'I made a payment for my order but it still shows as pending.', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { sender: 'support', message: 'We have verified your payment and confirmed it. Your order is now being processed.', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { sender: 'customer', message: 'Thank you! I can see the order is processing now.', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      ]),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      userId: sarahUser.id,
      subject: 'Delivery taking too long',
      category: 'delivery',
      description: 'My order FB-10004 has been in processing for 2 days. The product was listed as manual delivery but I expected it sooner. Can you provide an update?',
      status: 'open',
      priority: 'medium',
      messages: JSON.stringify([
        { sender: 'customer', message: 'My order has been in processing for 2 days. Can you provide an update?', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ]),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`  ✅ Created 2 tickets\n`);

  // ==========================================
  // 12. CREATE SITE SETTINGS
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
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.create({ data: setting });
  }

  console.log(`  ✅ Created ${siteSettings.length} site settings\n`);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('═══════════════════════════════════════');
  console.log('  🎉 Database seeding completed!');
  console.log('═══════════════════════════════════════');
  console.log(`  Users:          ${users.length}`);
  console.log(`  Categories:     ${categories.length}`);
  console.log(`  Products:       ${products.length}`);
  console.log(`  Coupons:        ${coupons.length}`);
  console.log(`  Orders:         ${orders.length}`);
  console.log(`  Reviews:        ${reviews.length}`);
  console.log(`  Notifications:  ${notifications.length}`);
  console.log(`  Referrals:      2`);
  console.log(`  Transactions:   ${transactions.length}`);
  console.log(`  Wallet Txns:    ${walletTransactions.length}`);
  console.log(`  Tickets:        2`);
  console.log(`  Site Settings:  ${siteSettings.length}`);
  console.log('═══════════════════════════════════════\n');
}

export { main as seedDatabase };
