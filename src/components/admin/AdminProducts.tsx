'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Product, Category, DeliveryType } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Pencil, Trash2, RefreshCw, Package } from 'lucide-react';

const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'Streaming', slug: 'streaming' },
  { id: '2', name: 'Gaming', slug: 'gaming' },
  { id: '3', name: 'Software', slug: 'software' },
  { id: '4', name: 'Gift Cards', slug: 'gift-cards' },
  { id: '5', name: 'VPN & Security', slug: 'vpn-security' },
];

interface ProductFormData {
  name: string;
  description: string;
  shortDesc: string;
  price: string;
  comparePrice: string;
  sku: string;
  categoryId: string;
  stock: string;
  deliveryType: DeliveryType;
  images: string;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  shortDesc: '',
  price: '',
  comparePrice: '',
  sku: '',
  categoryId: '',
  stock: '',
  deliveryType: 'automatic',
  images: '',
  isFeatured: false,
  isTrending: false,
  isNew: true,
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      shortDesc: product.shortDesc || '',
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      sku: product.sku,
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      deliveryType: product.deliveryType,
      images: product.images.join('\n'),
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
      isNew: product.isNew,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.sku || !form.categoryId) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        shortDesc: form.shortDesc || undefined,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        sku: form.sku,
        categoryId: form.categoryId,
        stock: parseInt(form.stock) || 0,
        deliveryType: form.deliveryType,
        images: form.images.split('\n').filter(Boolean),
        isFeatured: form.isFeatured,
        isTrending: form.isTrending,
        isNew: form.isNew,
      };

      const url = editId ? `/api/admin/products/${editId}` : '/api/admin/products';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchProducts();
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchProducts();
      }
    } catch {
      // handle error
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 bg-white/5" />
        <Skeleton className="h-64 w-full bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gradient-cyan">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 bg-emerald-500/15 text-emerald-400 font-semibold text-sm border border-emerald-500/30 hover:bg-emerald-500/25 transition-all glow-cyan"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/50" />
        <Input
          placeholder="Search products by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 glass-input"
        />
      </motion.div>

      {/* Product Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Add your first product to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-500/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">SKU</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Stock</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-emerald-500/5 hover:bg-emerald-500/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 overflow-hidden flex-shrink-0 border border-emerald-500/10">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/10">
                          <Package className="h-5 w-5 text-emerald-400/50" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[200px] text-foreground">{product.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {product.isFeatured && <Badge className="text-[10px] px-1 py-0 bg-amber-500/20 text-amber-400 border border-amber-500/30">Featured</Badge>}
                          {product.isNew && <Badge className="text-[10px] px-1 py-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">New</Badge>}
                          {product.isTrending && <Badge className="text-[10px] px-1 py-0 bg-violet-500/20 text-violet-400 border border-violet-500/30">Trending</Badge>}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">{product.sku}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm text-gradient-gold">${product.price.toFixed(2)}</p>
                      {product.comparePrice && (
                        <p className="text-xs text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      product.stock > 10 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      product.stock > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }>
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{product.category?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge className={
                      product.deliveryType === 'automatic'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }>
                      {product.deliveryType === 'automatic' ? '⚡ Auto' : '📋 Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleOpenEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10" onClick={() => setDeleteConfirm(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-strong border-emerald-500/20 sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-cyan">{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editId ? 'Update product information' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Product Name *</Label>
                <Input placeholder="e.g., Netflix Premium" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">SKU *</Label>
                <Input placeholder="e.g., NET-PRE-001" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="glass-input" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Short Description</Label>
              <Input placeholder="Brief product description" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} className="glass-input" />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Full Description</Label>
              <Textarea placeholder="Detailed product description..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Price (USDT) *</Label>
                <Input type="number" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" step="0.01" className="glass-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Compare Price</Label>
                <Input type="number" placeholder="0.00" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} min="0" step="0.01" className="glass-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Stock *</Label>
                <Input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" className="glass-input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Category *</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="glass-input"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent className="glass-strong border-emerald-500/20">
                    {DEMO_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Delivery Type</Label>
                <Select value={form.deliveryType} onValueChange={(v) => setForm({ ...form, deliveryType: v as DeliveryType })}>
                  <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-strong border-emerald-500/20">
                    <SelectItem value="automatic">⚡ Automatic</SelectItem>
                    <SelectItem value="manual">📋 Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Image URLs (one per line)</Label>
              <Textarea placeholder="https://example.com/image1.png&#10;https://example.com/image2.png" rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="glass-input" />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                <Label className="text-foreground">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isTrending} onCheckedChange={(v) => setForm({ ...form, isTrending: v })} />
                <Label className="text-foreground">Trending</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isNew} onCheckedChange={(v) => setForm({ ...form, isNew: v })} />
                <Label className="text-foreground">New</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
              onClick={handleSubmit}
              disabled={submitting || !form.name || !form.price || !form.sku}
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {editId ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="glass-strong border-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-gradient-cyan">Delete Product</DialogTitle>
            <DialogDescription className="text-muted-foreground">Are you sure you want to delete this product? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
