'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AllProductResDto } from '@/types/product';

interface ProductCardProps {
  product: AllProductResDto;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // 1. Check if all variants have a quantity equal to 0 (Sold Out)
  const isSoldOut = product.allProVariants.every((variant) => variant.quantity === 0);

  // 3. Image toggle logic on hover (fallback to primary if secondary doesn't exist)
  const primaryImage = product.primaryImg?.imageUrl || '/placeholder.png';
  const secondaryImage = product.secondaryImg?.imageUrl || primaryImage;
  const currentImage = isHovered ? secondaryImage : primaryImage;

  // 5. Check if any variant has a discount or sale price
  const hasSaleOrDiscount = product.allProVariants.some(
    (variant) => (variant.discount && variant.discount > 0) || (variant.salePrice && variant.salePrice > 0)
  );

  // Calculate lowest price for "From Rs X,XXX.00" label if multiple variants exist
  const minPrice = product.allProVariants.length > 0
    ? Math.min(...product.allProVariants.map((v) => (v.salePrice && v.salePrice > 0 ? v.salePrice : v.sellingPrice)))
    : 0;

  return (
    <div
      onClick={onClick}
      className="group flex flex-col cursor-pointer w-full max-w-sm bg-white overflow-hidden space-y-3"
    >
      {/* Image Container */}
      <div
        className="relative w-full h-[400px] bg-gray-100 rounded-2xl overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={currentImage}
          alt={product.title}
          fill
          unoptimized
          className="object-cover transition-opacity duration-300 ease-in-out"
          sizes="(max-width: 768px) 100vw, 384px"
        />

        {/* 1. New Arrival Tag */}
        {product.newArrival && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
            New Arrival
          </span>
        )}

        {/* 5. Sale Tag */}
        {hasSaleOrDiscount && !isSoldOut && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
            Sale
          </span>
        )}

        {/* 4. Sold Out Overlay / Tag */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-black text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-xl shadow-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col items-center text-center space-y-1.5 px-2">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 group-hover:underline truncate w-full">
          {product.title}
        </h3>

        {/* 2. Hide Price condition */}
        {!product.hidePrice && (
          <p className="text-xs text-gray-700 font-normal">
            From Rs {minPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}

        {/* 6. Available Colors Swatches with Out-of-Stock strike-through effect */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {product.allProVariants.map((variant) => {
            const isVariantOutOfStock = variant.quantity === 0;

            return (
              <div
                key={variant.id}
                className="relative group/swatch flex items-center justify-center"
                title={`${variant.colorName} ${isVariantOutOfStock ? '(Out of Stock)' : ''}`}
              >
                {/* Color Circle Swatch */}
                <span
                  className={`w-4 h-4 rounded-full border border-gray-300 shadow-xs transition-transform ${
                    isVariantOutOfStock ? 'opacity-40' : ''
                  }`}
                  style={{ backgroundColor: variant.colorCode }}
                />

                {/* Strike-through line if quantity equals 0 */}
                {isVariantOutOfStock && (
                  <span className="absolute w-6 h-[1.5px] bg-gray-400 rotate-45 pointer-events-none rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};