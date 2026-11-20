'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tag } from 'lucide-react';
import { RevalidatedCartItemDto } from '@/types/checkout';

export interface CheckoutDisplayItem {
  productId: number;
  variantId: number;
  title: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  available: boolean;
  revalidated?: RevalidatedCartItemDto;
}

interface OrderSummarySidebarProps {
  items: CheckoutDisplayItem[];
  totalItemCount: number;
  subtotal: number;
  deliveryFee: number;
  discountCodeInput: string;
  onDiscountCodeChange: (val: string) => void;
  onApplyDiscount: () => Promise<void>;
  isApplyingDiscount: boolean;
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
}

export const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
  items,
  totalItemCount,
  subtotal,
  deliveryFee,
  discountCodeInput,
  onDiscountCodeChange,
  onApplyDiscount,
  isApplyingDiscount,
  discountPercentage,
  discountAmount,
  finalTotal,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleApply = async () => {
    setLocalError(null);
    if (!discountCodeInput.trim()) {
      setLocalError('Enter a discount code');
      return;
    }
    try {
      await onApplyDiscount();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Invalid discount code');
    }
  };

  return (
    <aside className="bg-gray-50/80 border-t lg:border-t-0 lg:border-l border-gray-200 px-4 sm:px-8 py-8 lg:min-h-screen space-y-6">
      {/* Cart Line Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-16 h-16 rounded-lg border border-gray-200 bg-white shrink-0">
                <Image
                  src={item.imageUrl || '/placeholder.png'}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover rounded-lg"
                />
                <span className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{item.variantLabel}</p>
                {!item.available && (
                  <p className="text-xs text-red-600 font-medium mt-0.5">Out of stock</p>
                )}
              </div>
            </div>

            <span className="text-sm font-medium text-gray-900 shrink-0">
              Rs {(item.unitPrice * item.quantity).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        ))}
      </div>

      {/* Discount Code Input */}
      <div className="pt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCodeInput}
            onChange={(e) => onDiscountCodeChange(e.target.value)}
            placeholder="Discount code or gift card"
            className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplyingDiscount}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isApplyingDiscount ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {localError && <p className="text-xs text-red-600 mt-1.5">{localError}</p>}
        {discountPercentage > 0 && (
          <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            {discountPercentage}% discount applied
          </p>
        )}
      </div>

      {/* Totals Breakdown */}
      <div className="space-y-2.5 pt-4 border-t border-gray-200 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>
            Subtotal · {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="font-medium text-gray-900">
            Rs {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount ({discountPercentage}%)</span>
            <span>
              - Rs{' '}
              {discountAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-700">
          <span>Shipping</span>
          <span className="font-medium text-gray-900">
            {deliveryFee === 0
              ? 'FREE'
              : `Rs ${deliveryFee.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </span>
        </div>

        <div className="flex justify-between items-baseline pt-4 border-t border-gray-200">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <div className="text-right">
            <span className="text-xs text-gray-500 mr-1.5">LKR</span>
            <span className="text-lg font-bold text-gray-900">
              Rs{' '}
              {finalTotal.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};