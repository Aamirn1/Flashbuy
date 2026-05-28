'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, Package, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ProductCard from './ProductCard';
import { useStore } from '@/lib/store';
import type { Product, Category } from '@/lib/types';

export default function ProductGrid() {
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const selectedCategory = useStore((s) => s.selectedCategory);
  const setSelectedCategory = useStore((s) => s.setSelectedCategory);
  const sortBy = useStore((s) => s.sortBy);
  const setSortBy = useStore((s) => s.setSortBy);
  const navigate = useStore((s) => s.navigate);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } else {
        // Fallback demo data
        setProducts(generateDemoProducts());
        setTotalPages(1);
      }
    } catch {
      setProducts(generateDemoProducts());
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, page]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || data || []);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategorySelect = (catId: string | null) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name || null;

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
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
          {selectedCategoryName && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedCategoryName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filters */}
        <div className={`space-y-3 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedCategory ? 'default' : 'outline'}
              className="cursor-pointer text-sm py-1.5 px-3"
              onClick={() => handleCategorySelect(null)}
            >
              All Products
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5 px-3"
                onClick={() => handleCategorySelect(cat.id)}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
                {cat.productCount !== undefined && (
                  <span className="ml-1.5 text-xs opacity-60">({cat.productCount})</span>
                )}
              </Badge>
            ))}
          </div>
          {selectedCategory && (
            <button
              onClick={() => handleCategorySelect(null)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="size-3" /> Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Results info */}
      {!loading && products.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
          {selectedCategoryName && ` in ${selectedCategoryName}`}
        </p>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Package className="size-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            We couldn&apos;t find any products matching your criteria. Try adjusting your search or filters.
          </p>
          <Button variant="outline" onClick={() => { handleSearch(''); handleCategorySelect(null); }}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  className="w-9"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="px-2 text-muted-foreground">...</span>}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Load More (alternative) */}
      {!loading && products.length > 0 && totalPages <= 1 && products.length >= 12 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="gap-2">
            Load More
            <ChevronDown className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Default categories for fallback
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Software', slug: 'software', icon: '💻', productCount: 24 },
  { id: 'cat-2', name: 'Games', slug: 'games', icon: '🎮', productCount: 18 },
  { id: 'cat-3', name: 'Subscriptions', slug: 'subscriptions', icon: '🔄', productCount: 15 },
  { id: 'cat-4', name: 'Gift Cards', slug: 'gift-cards', icon: '🎁', productCount: 22 },
  { id: 'cat-5', name: 'Accounts', slug: 'accounts', icon: '🔑', productCount: 12 },
  { id: 'cat-6', name: 'E-Books', slug: 'ebooks', icon: '📚', productCount: 30 },
];

// Demo products for fallback
function generateDemoProducts(): Product[] {
  const names = [
    'Windows 11 Pro Key', 'Spotify Premium 1 Year', 'Netflix Gift Card $50',
    'Steam Wallet $100', 'Adobe Creative Cloud 1 Month', 'Xbox Game Pass Ultimate',
    'PlayStation Plus 12 Month', 'Minecraft Java Edition', 'Discord Nitro 1 Year',
    'Apple Gift Card $25', 'Google Play $50', 'Amazon Gift Card $100',
  ];
  const deliveryTypes: ('automatic' | 'manual')[] = ['automatic', 'manual'];
  const categoryIds = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'];

  return names.map((name, i) => {
    const id = `prod-${i + 1}`;
    const price = parseFloat((Math.random() * 80 + 5).toFixed(2));
    const comparePrice = Math.random() > 0.5 ? parseFloat((price * (1.2 + Math.random() * 0.5)).toFixed(2)) : undefined;
    const hue = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

    return {
      id,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: `Premium quality ${name}. Instant delivery with full warranty and support. Get the best deal on ${name} at Flash Buy.`,
      shortDesc: `Get ${name} at the best price`,
      images: [],
      price,
      comparePrice,
      sku: `SKU-${1000 + i}`,
      categoryId: categoryIds[i % categoryIds.length],
      stock: Math.floor(Math.random() * 50) + 1,
      deliveryType: deliveryTypes[i % 2],
      isFeatured: i < 4,
      isNew: i >= 8,
      isTrending: i >= 4 && i < 8,
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 200) + 5,
      soldCount: Math.floor(Math.random() * 500) + 10,
    };
  });
}
