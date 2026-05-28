'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Order } from '@/lib/types';
import { ORDER_STATUS_COLORS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  CircleDot,
  XCircle,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'paid', label: 'Paid', icon: CreditCard },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export function OrderDetail() {
  const { selectedOrderId, navigate, goBack } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedOrderId) {
      fetchOrder(selectedOrderId);
    }
  }, [selectedOrderId]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order || data);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" className="mt-4" onClick={goBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  const isRefunded = order.status === 'refunded';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Order {order.orderNumber}</h2>
          <p className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant="secondary" className={`${ORDER_STATUS_COLORS[order.status] || ''} text-sm px-3 py-1`}>
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {isCancelled || isRefunded ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-semibold text-red-800">
                  {isCancelled ? 'Order Cancelled' : 'Order Refunded'}
                </p>
                <p className="text-sm text-red-600">This order was {isCancelled ? 'cancelled' : 'refunded'}.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between relative">
              {/* Progress Bar */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${currentStep >= 0 ? (currentStep / (ORDER_STEPS.length - 1)) * 100 : 0}%` }}
                />
              </div>

              {ORDER_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-muted-foreground/30 text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <p className={`text-xs mt-2 font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg border">
                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.product?.name || `Product #${item.productId}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                  {item.deliveryData && (
                    <div className="mt-2 p-2 rounded bg-green-50 border border-green-200">
                      <p className="text-xs font-medium text-green-800 flex items-center gap-1">
                        <Truck className="h-3 w-3" /> Delivery Data:
                      </p>
                      <p className="text-xs text-green-700 mt-1 font-mono break-all">{item.deliveryData}</p>
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm">${item.total.toFixed(2)}</p>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              {order.fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span>${order.fee.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment & Delivery Info */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod || 'USDT'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge
                  variant="secondary"
                  className={
                    order.paymentStatus === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : order.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : order.paymentStatus === 'refunded'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {getStatusLabel(order.paymentStatus)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Type</span>
                <Badge variant="outline">
                  {order.deliveryStatus === 'automatic' ? '⚡ Automatic' : '📋 Manual'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Status</span>
                <Badge
                  variant="secondary"
                  className={
                    order.deliveryStatus === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {getStatusLabel(order.deliveryStatus)}
                </Badge>
              </div>
              {order.items.some((i) => i.deliveryData) && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Products Delivered
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Your product codes/keys are shown in the items section above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
