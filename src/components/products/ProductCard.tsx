'use client';

import { ShoppingCart, Star, Zap, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useStore((s) => s.addToCart);
  const navigate = useStore((s) => s.navigate);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const initials = product.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Deterministic color from product id
  const hue = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  const inStock = product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
      deliveryType: product.deliveryType,
      stock: product.stock,
    });
  };

  const handleCardClick = () => {
    navigate('product-detail', product.id);
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden py-0 gap-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border-border/60"
      onClick={handleCardClick}
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: `hsl(${hue}, 60%, 55%)` }}
          >
            {initials}
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <Badge className="bg-red-500 text-white border-none text-xs font-semibold shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-emerald-500 text-white border-none text-xs font-semibold shadow-sm">
              NEW
            </Badge>
          )}
          {product.isTrending && (
            <Badge className="bg-orange-500 text-white border-none text-xs font-semibold shadow-sm">
              HOT
            </Badge>
          )}
        </div>

        {/* Stock status */}
        <div className="absolute top-2 right-2">
          {inStock ? (
            <Badge variant="secondary" className="bg-white/90 text-green-700 border-none text-xs shadow-sm backdrop-blur-sm">
              In Stock
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-white/90 text-red-600 border-none text-xs shadow-sm backdrop-blur-sm">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 pb-2 space-y-2">
        {/* Delivery type badge */}
        <div className="flex items-center gap-1.5">
          {product.deliveryType === 'automatic' ? (
            <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-200 bg-emerald-50">
              <Zap className="size-3" />
              Auto Delivery
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-200 bg-amber-50">
              <Clock className="size-3" />
              Manual Delivery
            </Badge>
          )}
        </div>

        {/* Name & Description */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary/80 transition-colors">
          {product.name}
        </h3>
        {product.shortDesc && (
          <p className="text-xs text-muted-foreground line-clamp-1">{product.shortDesc}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-3.5 ${
                  star <= Math.round(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {product.price.toFixed(2)} USDT
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {product.comparePrice.toFixed(2)} USDT
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          size="sm"
          className="w-full gap-2 font-medium"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          <ShoppingCart className="size-4" />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
