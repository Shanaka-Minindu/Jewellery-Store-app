'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { OrderCheckout } from '@/components/checkout/OrderCheckout';
import apiClient from '@/lib/axios';


export default function CheckOutPage() {
  // Replace with your real auth context/session state if available
  const isAuthenticated = false;

  const handleValidateDiscount = async (code: string) => {
    const response = await apiClient.get<{
      percentage: number;
      expDate: string;
      valid: boolean;
    }>(`/getdiscount/${encodeURIComponent(code)}`);
    return response.data;
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Top Checkout Bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif tracking-wide text-gray-900">
            Urban Collection
          </Link>
          <Link href="/" aria-label="Store" className="text-gray-800 hover:text-black">
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
          </Link>
        </div>
      </header>

      <OrderCheckout
        isAuthenticated={isAuthenticated}
        onValidateDiscount={handleValidateDiscount}
      />
    </main>
  );
}