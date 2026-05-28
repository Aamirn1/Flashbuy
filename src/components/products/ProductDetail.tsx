'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Zap,
  Clock,
  ArrowLeft,
  Shield,
  Truck,
  Package,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';

export default function ProductDetail() {
  const selectedProductId = useStore((s) => s.selectedProductId);
  const addToCart = useStore((s) => s.addToCart);
  const navigate = useStore((s) => s.navigate);
  const goBack = useStore((s) => s.goBack);

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  // Derive loading from whether we have a product for the current ID
  const loading = product === null || product.id !== selectedProductId;

  useEffect(() => {
    if (!selectedProductId) return;
    let cancelled = false;

    fetch(`/api/products/${selectedProductId}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then((data) => {
        if (!cancelled) {
          setProduct(data.product || data);
          setSelectedImage(0);
          setQuantity(1);
        }
      })
      .catch(() => {
        if (!cancelled) setProduct(generateDemoProduct(selectedProductId));
      });

    return () => { cancelled = true; };
  }, [selectedProductId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0] || '',
      deliveryType: product.deliveryType,
      stock: product.stock,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const discountPercent =
    product?.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const initials = product?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

  const hue = product?.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => navigate('products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('home')} className="cursor-pointer">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('products')} className="cursor-pointer">
              Products
            </BreadcrumbLink>
          </BreadcrumbItem>
          {product.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer">{product.category.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[200px]">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back button */}
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            {product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-white font-bold text-5xl"
                style={{ backgroundColor: `hsl(${hue % 360}, 60%, 55%)` }}
              >
                {initials}
              </div>
            )}

            {/* Image Navigation */}
            {product.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow-md size-9"
                  onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow-md size-9"
                  onClick={() => setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discountPercent > 0 && (
                <Badge className="bg-red-500 text-white border-none font-semibold shadow-md">
                  -{discountPercent}% OFF
                </Badge>
              )}
              {product.isNew && (
                <Badge className="bg-emerald-500 text-white border-none font-semibold shadow-md">
                  NEW
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 size-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === selectedImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.deliveryType === 'automatic' ? (
                <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200 bg-emerald-50">
                  <Zap className="size-3" />
                  Auto Delivery
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
                  <Clock className="size-3" />
                  Manual Delivery
                </Badge>
              )}
              {product.isTrending && (
                <Badge variant="outline" className="gap-1 text-orange-600 border-orange-200 bg-orange-50">
                  🔥 Trending
                </Badge>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-4 ${
                      star <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">{product.soldCount} sold</span>
            </div>
          </div>

          <Separator />

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {product.price.toFixed(2)} USDT
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.comparePrice.toFixed(2)} USDT
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <p className="text-sm text-red-500 font-medium">
                You save {(product.comparePrice! - product.price).toFixed(2)} USDT ({discountPercent}% off)
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <div className="size-2.5 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">
                  In Stock ({product.stock} available)
                </span>
              </>
            ) : (
              <>
                <div className="size-2.5 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {/* SKU */}
          <p className="text-xs text-muted-foreground">
            SKU: <span className="font-mono">{product.sku}</span>
          </p>

          <Separator />

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-r-none"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-l-none"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2 text-base font-semibold"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {addedToCart ? (
                <>
                  <Check className="size-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="size-5" />
                  Add to Cart — {(product.price * quantity).toFixed(2)} USDT
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                handleAddToCart();
                setTimeout(() => navigate('cart'), 300);
              }}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
          </div>

          <Separator />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50 text-center">
              <Shield className="size-5 text-emerald-600" />
              <span className="text-xs font-medium">Buyer Protection</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50 text-center">
              {product.deliveryType === 'automatic' ? (
                <Zap className="size-5 text-amber-500" />
              ) : (
                <Truck className="size-5 text-amber-500" />
              )}
              <span className="text-xs font-medium">
                {product.deliveryType === 'automatic' ? 'Instant Delivery' : 'Manual Delivery'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50 text-center">
              <Package className="size-5 text-primary" />
              <span className="text-xs font-medium">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="mt-8">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.reviewCount})
          </TabsTrigger>
          <TabsTrigger value="delivery">Delivery Info</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Rating summary */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{product.rating.toFixed(1)}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-4 ${
                            star <= Math.round(product.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 55 : star === 4 ? 28 : star === 3 ? 10 : star === 2 ? 4 : 3;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-3">{star}</span>
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-muted-foreground">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sample reviews */}
                <div className="space-y-4">
                  {[
                    { name: 'Alex M.', rating: 5, comment: 'Excellent product! Fast delivery and great quality. Would recommend to anyone.', date: '2 days ago' },
                    { name: 'Sarah K.', rating: 4, comment: 'Good value for the price. Delivery was quick. Minor issue but support resolved it fast.', date: '1 week ago' },
                    { name: 'James R.', rating: 5, comment: 'Perfect! Exactly as described. The automatic delivery was instant. Very happy!', date: '2 weeks ago' },
                  ].map((review, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {review.name[0]}
                          </div>
                          <span className="text-sm font-medium">{review.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-3.5 ${
                              star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {product.deliveryType === 'automatic' ? (
                  <>
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <Zap className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-emerald-800">Automatic Delivery</h4>
                        <p className="text-sm text-emerald-700 mt-1">
                          This product is delivered automatically after payment confirmation. Your product details
                          will be available immediately in your dashboard once the blockchain confirms your payment.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">How it works:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Complete your purchase with USDT (TRC20 or BEP20)</li>
                        <li>Wait for blockchain confirmation (1-5 minutes)</li>
                        <li>Receive your product details instantly in your dashboard</li>
                        <li>Access your purchase anytime from the Orders page</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <Clock className="size-5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800">Manual Delivery</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          This product requires manual processing. After payment confirmation, our team will
                          prepare and deliver your order within the estimated time frame.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Delivery timeline:</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Payment confirmation: 1-5 minutes</li>
                        <li>Order processing: Up to 24 hours</li>
                        <li>You&apos;ll receive a notification when your order is ready</li>
                        <li>Track your order status from the Orders page</li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Shield className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Buyer Protection</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      All purchases are covered by our Buyer Protection program. If your order is not delivered
                      as described, you are eligible for a full refund.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function generateDemoProduct(id: string): Product {
  const hue = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const price = parseFloat(((hue % 80) + 5).toFixed(2));
  const comparePrice = Math.random() > 0.4 ? parseFloat((price * 1.4).toFixed(2)) : undefined;

  return {
    id,
    name: 'Premium Digital Product',
    slug: 'premium-digital-product',
    description:
      'This is a premium digital product available on Flash Buy. Get instant access after payment confirmation. Our products are sourced from verified sellers and come with full buyer protection.\n\nKey Features:\n• Instant delivery after payment\n• Full buyer protection\n• 24/7 customer support\n• Verified and authentic\n• Lifetime access where applicable',
    shortDesc: 'Premium quality digital product with instant delivery',
    images: [],
    price,
    comparePrice,
    sku: `SKU-${id.slice(-4).toUpperCase()}`,
    categoryId: 'cat-1',
    stock: 50,
    deliveryType: 'automatic',
    isFeatured: true,
    isNew: true,
    isTrending: true,
    rating: 4.5,
    reviewCount: 128,
    soldCount: 356,
  };
}
