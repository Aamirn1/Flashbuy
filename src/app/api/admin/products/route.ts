import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') +
    '-' + Date.now().toString(36);
}

export async function GET(request: NextRequest) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const parsedProducts = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
    }));

    return NextResponse.json({
      products: parsedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin products list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user: adminUser, error: authError } = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      name,
      description,
      shortDesc,
      price,
      comparePrice,
      sku,
      categoryId,
      stock,
      deliveryType,
      deliveryInfo,
      images,
      isFeatured,
      isNew,
      isTrending,
    } = body;

    if (!name || !description || price === undefined || !sku || !categoryId) {
      return NextResponse.json(
        { error: 'Name, description, price, sku, and categoryId are required' },
        { status: 400 }
      );
    }

    // Check SKU uniqueness
    const existingProduct = await db.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 409 }
      );
    }

    const slug = generateSlug(name);

    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        shortDesc: shortDesc || null,
        price,
        comparePrice: comparePrice || null,
        sku,
        categoryId,
        stock: stock || 0,
        deliveryType: deliveryType || 'automatic',
        deliveryInfo: deliveryInfo || null,
        images: JSON.stringify(images || []),
        isFeatured: isFeatured || false,
        isNew: isNew || false,
        isTrending: isTrending || false,
      },
      include: { category: true },
    });

    const parsedProduct = {
      ...product,
      images: JSON.parse(product.images || '[]'),
    };

    return NextResponse.json({ product: parsedProduct }, { status: 201 });
  } catch (error) {
    console.error('Admin product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
