'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Zap, Clock, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';

type FilterType = 'trending' | 'bestseller' | 'new';

const tabConfig: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: 'trending', label: 'Trending', icon: <Zap className="size-3.5" /> },
  { value: 'bestseller', label: 'Best Sellers', icon: <Star className="size-3.5" /> },
  { value: 'new', label: 'New Arrivals', icon: <Clock className="size-3.5" /> },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { navigate, addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '/images/placeholder.png',
      deliveryType: product.deliveryType,
      stock: product.stock,
    });
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={() => navigate('product-detail', product.id)}
    >
      <Card className="group overflow-hidden border border-border/50 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 py-0 gap-0">
        {/* Image area */}
        <div className="relative aspect-[4/3] bg-muted/50 overflow-hidden">
          <img
            src={product.images[0] || '/images/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isNew && (
              <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 font-semibold">
                NEW
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 font-semibold">
                -{discount}%
              </Badge>
            )}
          </div>
          {/* Delivery badge */}
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0.5 font-medium backdrop-blur-sm ${
                product.deliveryType === 'automatic'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              }`}
            >
              {product.deliveryType === 'automatic' ? (
                <Zap className="size-3 mr-0.5" />
              ) : (
                <Package className="size-3 mr-0.5" />
              )}
              {product.deliveryType === 'automatic' ? 'Instant' : 'Manual'}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-2.5">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>

          <StarRating rating={product.rating} />

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-600">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-3.5 mr-1" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<FilterType>('trending');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?filter=${activeTab}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || data || []);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Featured{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Products
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our most popular digital products, all available for instant purchase with USDT.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterType)}>
          <div className="flex justify-center mb-8">
            <TabsList className="bg-muted/50">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white gap-1.5 px-4"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden animate-pulse py-0 gap-0">
                      <div className="aspect-[4/3] bg-muted" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-5 bg-muted rounded w-1/3" />
                        <div className="h-8 bg-muted rounded" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Package className="size-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No products found in this category.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                  >
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
