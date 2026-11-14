'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from './ui/button';

export const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCartStore();
  const router = useRouter();

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/buy');
  };

  return (
    <Drawer swipeDirection="right" open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DrawerContent className="max-h-fit bg-white p-6 flex flex-col sm:w-[450px] justify-between">
        {/* Top Header */}
        <div>
          <DrawerHeader className="flex flex-row justify-between items-center border-b border-gray-200 pb-4 px-0 pt-0">
            <DrawerTitle className="text-base font-bold tracking-wider uppercase text-gray-900">
              Your Cart ({totalItemsCount})
            </DrawerTitle>
            <DrawerClose>
            <Button
              variant="ghost"
              size="lg"
              className="h-10 w-10 rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
            </DrawerClose>
          </DrawerHeader>

          {/* Cart Items List */}
          {items.length === 0 ? (
            <div className="py-24 text-center text-gray-500 font-medium text-sm">Your cart is currently empty.</div>
          ) : (
            <div className="space-y-6 overflow-y-auto  py-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-b-0">
                  {/* Product Image */}
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={item.image} alt={item.productTitle} fill className="object-cover" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium text-gray-900 leading-snug">{item.productTitle}</h4>
                    <p className="text-xs text-gray-500">Color: {item.colorName}</p>
                    {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}

                    {/* Quantity Stepper & Trash Icon Row */}
                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center border border-gray-300 rounded-xl px-2 py-1 bg-white">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="text-gray-500 hover:text-black cursor-pointer p-1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="text-gray-500 hover:text-black cursor-pointer p-1 disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">
                      Rs {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Subtotal & Checkout */}
        {items.length > 0 && (
          <DrawerFooter className="border-t border-gray-200 pt-6 px-0 pb-2 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-base font-normal text-gray-900">Subtotal</span>
                <span className="text-base font-medium text-gray-900">
                  Rs {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR
                </span>
              </div>
              <p className="text-xs text-gray-500">Taxes and shipping calculated at checkout</p>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-[#212121] text-white text-sm font-medium tracking-wide uppercase rounded-xl hover:bg-black transition-colors cursor-pointer text-center"
            >
              Check Out
            </button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};