'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CategoryResDto } from '@/types/category';
import { AllProductResDto, AllProductsReqWithFiltersDto, MasterColor } from '@/types/product';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { colorService } from '@/services/colorService';
import { ProductCard } from '@/components/ProductCard';

import { Check, ChevronDown } from 'lucide-react';
import { Pagination } from './ui/Pagination';

interface ProductsViewProps {
  gender: string;
  initialCategoryId?: number;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  gender,
  initialCategoryId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pathname = usePathname();

  const [categories, setCategories] = useState<CategoryResDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    initialCategoryId || Number(searchParams.get('category')) || undefined
  );
  const [masterColors, setMasterColors] = useState<MasterColor[]>([]);
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  
  const [products, setProducts] = useState<AllProductResDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 8;

  // Fetch categories and colors on mount
  useEffect(() => {
    const loadMetaData = async () => {
      try {
        const [cats, colors] = await Promise.all([
          categoryService.fetchCategories(),
          colorService.getColors(),
        ]);
       
console.log(pathname);
        setCategories(cats);
        setMasterColors(colors);
      } catch (error) {
        console.error('Failed to load metadata', error);
      }
    };
    loadMetaData();
  }, []);

  // Filter categories matching the current gender (supporting MALE/FEMALE and plural route params)
  const filteredCategories = categories.filter((cat) => {
    const catGender = cat.gender?.toLowerCase() || '';
    const currentGender = gender.toLowerCase();
    
    // Map plural route params to your backend enum values ('male' / 'female')
    const matchesGender = 
      (currentGender === 'men' && catGender === 'male') ||
      (currentGender === 'women' && catGender === 'female') ||
      catGender === currentGender;

    return matchesGender || cat.gender === 'UNISEX';
  });

  // Fetch products whenever filters or page changes
  useEffect(() => {
    const fetchProductsData = async () => {
      setIsLoading(true);
      try {
        const filters: AllProductsReqWithFiltersDto = {
          categoryIds: selectedCategoryId ? [selectedCategoryId] : filteredCategories.map(c => c.id),
          colorIds: selectedColorIds.length > 0 ? selectedColorIds : undefined,
          leastPrice: minPrice,
          maxPrice: maxPrice,
          productsPerPage: productsPerPage,
          pageNumber: currentPage,
        };

        const data = await productService.getAllProducts(filters);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch filtered products', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsData();
  }, [selectedCategoryId, selectedColorIds, minPrice, maxPrice, currentPage, gender, categories]);

  const handleCategoryClick = (catId: number) => {
    setSelectedCategoryId(catId);
    setCurrentPage(0);
    router.push(`/store/${gender.toLowerCase()}?category=${catId}`, { scroll: false });
  };

  const handleColorToggle = (colorId: number) => {
    setSelectedColorIds((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]
    );
    setCurrentPage(0);
  };

  return (
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Filter Pills */}
      <div className="flex items-center justify-center flex-wrap gap-3 pb-6 border-b border-gray-200">
        {filteredCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cat.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Filters */}
        <div className="space-y-8 lg:col-span-1 pr-4 border-r border-gray-100">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest text-gray-900 uppercase border-b pb-2">Availability</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                />
                In stock
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outOfStockOnly}
                  onChange={(e) => setOutOfStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                />
                Out of stock
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest text-gray-900 uppercase border-b pb-2">Price</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 uppercase">Min (LKR)</span>
                <input
                  type="number"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none"
                />
              </div>
              <span className="text-gray-400 pt-4">-</span>
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 uppercase">Max (LKR)</span>
                <input
                  type="number"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="10000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold tracking-widest text-gray-900 uppercase border-b pb-2">Color</h3>
            <div className="flex flex-wrap gap-3 pt-1">
              {masterColors.map((col) => {
                const isSelected = selectedColorIds.includes(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => handleColorToggle(col.id)}
                    className={`relative w-7 h-7 rounded-full border shadow-xs flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                      isSelected ? 'ring-2 ring-black ring-offset-2' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: col.colorCode }}
                    title={col.colorName}
                  >
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${['#ffffff', '#fff', '#f3f4f6'].includes(col.colorCode.toLowerCase()) ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-sm text-gray-600 pb-4 border-b border-gray-100">
            <span>{products.length} products</span>
            <div className="flex items-center gap-2 cursor-pointer hover:text-black">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Sort by:</span>
              <span className="font-semibold text-gray-900">Best selling</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-12">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              No products found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => router.push(pathname.startsWith("/store")?`${pathname}/${product.id}`:`/product/${product.id}`)}
                />  
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(products.length / productsPerPage) || 1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};