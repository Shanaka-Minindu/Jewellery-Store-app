'use client';

import React, { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { DetailedProductView, ProductVariant } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ChevronDown, ChevronUp, ShoppingBag, Zap, X, Maximize2, Plus, Minus, Truck, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { AdminProductDeleteAndEdit } from '@/components/ui/admin/adminProductDeleteAndEdit';

interface ProductViewContentProps {
  params: Promise<{ productId: string }>;
}

export default function ProductViewContent({ params }: ProductViewContentProps) {
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<DetailedProductView | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [showAllImages, setShowAllImages] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isDescOpen, setIsDescOpen] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);

  const { addToCart, setIsCartOpen } = useCartStore();
  const router = useRouter();

  // Resolve params promise safely
  useEffect(() => {
    params.then((p) => setProductId(p.productId));
  }, [params]);
  
  // Fetch product details
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const data = await productService.getDetailedProductById(productId);
        setProduct(data);

        // Requirement 9: Initialize with the variant having the least/cheapest final price
        if (data.variants && data.variants.length > 0) {
          const cheapestVariant = data.variants.reduce((prev, curr) => {
            const getPrice = (v: ProductVariant) => {
              if (v.salePrice && v.salePrice > 0) return Number(v.salePrice);
              if (v.discount && v.discount > 0) return Number(v.sellingPrice) * (1 - Number(v.discount) / 100);
              return Number(v.sellingPrice);
            };
            return getPrice(curr) < getPrice(prev) ? curr : prev;
          });
          setSelectedVariant(cheapestVariant);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        toast.error('Failed to load product details.');
      }
    };
    fetchProduct();
  }, [productId]);

  if (!product || !selectedVariant) {
    return <div className="py-20 text-center text-gray-500 font-medium">Loading product details...</div>;
  }

  // Requirement 1: Calculate ratings from reviews array
  const totalReviews = product.reviews.length;
  const averageRating = totalReviews > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    : 0;

  // Requirement 8: If salePrice has a value, use it. If both exist, use salePrice only.
  const hasSale = selectedVariant.salePrice !== null && selectedVariant.salePrice !== undefined && Number(selectedVariant.salePrice) > 0;
  const hasDiscount = selectedVariant.discount !== null && selectedVariant.discount !== undefined && Number(selectedVariant.discount) > 0;
  
  let finalPrice = Number(selectedVariant.sellingPrice);
  if (hasSale) {
    finalPrice = Number(selectedVariant.salePrice);
  } else if (hasDiscount) {
    finalPrice = Number(selectedVariant.sellingPrice) * (1 - Number(selectedVariant.discount) / 100);
  }

  const images = selectedVariant.images || [];
  const visibleImages = showAllImages ? images : images.slice(0, 5);

  const handleAddToCart = () => {
    if (selectedVariant.quantity <= 0) {
      toast.error('Selected variant is out of stock.');
      return;
    }
    addToCart({
      productId: product.id,
      productTitle: product.title,
      variantId: selectedVariant.id,
      colorName: selectedVariant.color.colorName,
      colorCode: selectedVariant.color.colorCode,
      size: product.size,
      price: finalPrice,
      quantity: quantity,
      image: images[0]?.imageUrl || '',
      maxStock: selectedVariant.quantity,
    });
  
    toast.success('Added to cart successfully!');
  };

  const handleBuyNow = () => {
    if (selectedVariant.quantity <= 0) {
      toast.error('Selected variant is out of stock.');
      return;
    }
    router.push(`/buy?productId=${product.id}&variantId=${selectedVariant.id}&qty=${quantity}`);
  };

  async function deletePro(id:number){
    try{
      await productService.deleteProduct(id);
      toast.success("Product Deleted Successfully")
      router.push("/admin/products")
    }catch(e){
      toast.error('Product deleting error.');
    }
    
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <AdminProductDeleteAndEdit productDetails={product} onProductDeleted={deletePro}/>
{/* Left Column: Image Gallery (Stacked Layout) */}
<div className="space-y-4 w-full">
  {/* Main Display Image */}
  <div 
    onClick={() => setIsLightboxOpen(true)}
    className="relative w-full h-[720px] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
  >
    <Image
      src={images[selectedImageIdx]?.imageUrl || images[0]?.imageUrl || '/placeholder.png'}
      alt={product.title}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
      <Maximize2 className="w-5 h-5" />
    </div>
  </div>

  {/* Thumbnail Gallery Grid Stacked Below (2 columns on mobile/tablet, customizable) */}
  <div className="grid grid-cols-2 gap-4">
    {visibleImages.map((img, idx) => (
      <div
        key={img.id}
        onClick={() => setSelectedImageIdx(idx)}
        className={`relative h-[280px] rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-all ${
          selectedImageIdx === idx ? 'border-black' : 'border-transparent opacity-80 hover:opacity-100'
        }`}
      >
        <Image src={img.imageUrl} alt="thumbnail" fill className="object-cover" />
      </div>
    ))}
  </div>

  {images.length > 5 && (
    <button
      onClick={() => setShowAllImages(!showAllImages)}
      className="text-xs font-semibold text-gray-900 underline cursor-pointer pt-1 block text-center w-full"
    >
      {showAllImages ? 'Show Less' : `Show All Images (${images.length})`}
    </button>
  )}
</div>

      {/* Right Column: Product Details & Actions */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 uppercase">
            {product.title}
          </h1>
          
          {/* Requirement 1: Star Rating & Review Count */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center text-black">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        {/* Requirement 7: Hide price check */}
        {!product.hidePrice && (
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-gray-900">
              Rs {finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {(hasSale || hasDiscount) && (
              <span className="text-sm text-gray-400 line-through">
                Rs {Number(selectedVariant.sellingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            )}
            {hasDiscount && !hasSale && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold">
                {selectedVariant.discount}% OFF
              </span>
            )}
            {hasSale && (
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-md font-bold uppercase">
                Sale
              </span>
            )}
          </div>
        )}

        {/* Requirement 2: Color Swatches & Corresponding Images */}
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Color: <span className="font-normal text-gray-900">{selectedVariant.color.colorName}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant.id === variant.id;
              const isOutOfStock = variant.quantity === 0;

              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setSelectedImageIdx(0);
                    setShowAllImages(false);
                  }}
                  className={`relative flex items-center gap-2 px-3.5 py-2 border rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isOutOfStock ? 'opacity-50' : ''}`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-xs"
                    style={{ backgroundColor: variant.color.colorCode }}
                  />
                  <span className="text-sm font-medium text-gray-900">{variant.color.colorName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Display Badge */}
        {product.size && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Size:</label>
            <div>
              <span className="inline-block px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900">
                {product.size}
              </span>
            </div>
          </div>
        )}

        {/* Free Shipping Notice */}
        <div className="flex items-center gap-2.5 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200">
          <Truck className="w-4 h-4 text-gray-900 flex-shrink-0" />
          <span>FREE SHIPPING WHEN YOU BUY MORE THAN 1 PRODUCT</span>
        </div>

        {/* Requirement 7: Hide quantity, Add to Cart, and Buy Now buttons if hidePrice is true */}
        {!product.hidePrice && (
          <div className="space-y-4 pt-2">
            {/* Quantity Stepper & Add to Cart Container */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-500 hover:text-black cursor-pointer px-1"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant.quantity, quantity + 1))}
                  disabled={quantity >= selectedVariant.quantity}
                  className="text-gray-500 hover:text-black cursor-pointer px-1 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={selectedVariant.quantity <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 shadow-sm text-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={selectedVariant.quantity <= 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-black text-black font-medium rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 text-sm"
            >
              <Zap className="w-4 h-4" /> Buy Now
            </button>
          </div>
        )}

        {/* Requirement 6: Collapsible Description */}
        {product.description && (
          <div className="border-t border-gray-200 pt-6 space-y-2">
            <button
              onClick={() => setIsDescOpen(!isDescOpen)}
              className="w-full flex justify-between items-center text-xs font-bold tracking-widest uppercase text-gray-700 cursor-pointer"
            >
              <span>Description</span>
              {isDescOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isDescOpen && (
              <div className="text-sm text-gray-600 leading-relaxed pt-2 whitespace-pre-line">
                {product.description}
              </div>
            )}
          </div>
        )}
      </div>

{/* Requirement 3: Full Screen Lightbox Modal */}
{isLightboxOpen && (
  <div 
    className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 outline-none"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') {
        setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    }}
  >
    {/* Close Button */}
    <button
      onClick={() => setIsLightboxOpen(false)}
      className="absolute top-6 right-6 text-white hover:text-gray-300 bg-white/10 p-2.5 rounded-full cursor-pointer z-10"
    >
      <X className="w-6 h-6" />
    </button>

    {/* Image Counter Badge (Optional helper) */}
    <div className="absolute top-6 left-6 text-white/70 text-sm font-medium">
      {selectedImageIdx + 1} / {images.length}
    </div>

    {/* Main Container with Left/Right Arrows */}
    <div className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center">
      {/* Previous Arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          }}
          className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all cursor-pointer"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Current Active Image */}
      <div className="relative w-full h-full">
        <Image
          src={images[selectedImageIdx]?.imageUrl || ''}
          alt="fullscreen view"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Next Arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          }}
          className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all cursor-pointer"
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  </div>
)}
    </div>
  );
}