'use client';

import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { Pagination } from './Pagination';
import { FilterDrawer } from '../FilterDrawer';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { colorService } from '@/services/colorService';
import { AllProductResDto, MasterColor } from '@/types/product';
import { CategoryResDto } from '@/types/category';
import { toast } from 'sonner';


interface ProductCardProps {
    seletedProductId: (productId:number) => void;
  }

export const AllProduct = ({seletedProductId}:ProductCardProps) => {
  // Read products per page from .env with default fallback to 20
  const defaultPerPage = Number(process.env.NEXT_PUBLIC_PRODUCTS_PER_PAGE) || 20;

  const [products, setProducts] = useState<AllProductResDto[]>([]);
  const [categories, setCategories] = useState<CategoryResDto[]>([]);
  const [colors, setColors] = useState<MasterColor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Pagination States
  const [pageNumber, setPageNumber] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(defaultPerPage);
  const [itemsPerRow, setItemsPerRow] = useState(4); // Default 4 items per row
  const [searchKeyWord, setSearchKeyWord] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [newArrival, setNewArrival] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [leastPrice, setLeastPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch initial filter data options (categories & colors)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catData, colorData] = await Promise.all([
          categoryService.fetchCategories(),
          colorService.getColors(),
        ]);
        setCategories(catData);
        setColors(colorData);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products when filters or pagination change
  useEffect(() => {
    const fetchProductsData = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getAllProducts({
          categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
          colorIds: selectedColors.length > 0 ? selectedColors : undefined,
          newArrival: newArrival || undefined,
          saleOrDiscountItem: saleOnly || undefined,
          leastPrice: leastPrice ? Number(leastPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          searchKeyWord: searchKeyWord || undefined,
          productsPerPage: productsPerPage,
          pageNumber: pageNumber,
        });
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
        toast.error('Failed to load products.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsData();
  }, [selectedCategories, selectedColors, newArrival, saleOnly, leastPrice, maxPrice, searchKeyWord, productsPerPage, pageNumber]);

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setNewArrival(false);
    setSaleOnly(false);
    setLeastPrice('');
    setMaxPrice('');
    setSearchKeyWord('');
    setPageNumber(0);
  };

  // Dynamic grid class mapping based on items per row selection
  const gridColumnClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }[itemsPerRow] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Bar Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter Options
        </button>

        {/* Search Input */}
        {/* <input
          type="text"
          placeholder="Search products by title..."
          value={searchKeyWord}
          onChange={(e) => {
            setSearchKeyWord(e.target.value);
            setPageNumber(0); // reset page on new search query
          }}
          className="w-full md:w-72 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
        /> */}

        {/* Items Per Row Selector */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>Items per row:</span>
          <select
            value={itemsPerRow}
            onChange={(e) => setItemsPerRow(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium cursor-pointer"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>

        
      </div>

      {/* Product Grid Listing */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products found matching your criteria.</div>
      ) : (
        <div className={`grid ${gridColumnClass} gap-6`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={()=>seletedProductId(product.id)} />
          ))}
        </div>
      )}

      {/* Pagination Component */}
      <Pagination
        currentPage={pageNumber}
        // Since backend fetches page chunks, if items returned matches productsPerPage, allow navigating forward
        totalPages={products.length < productsPerPage ? pageNumber + 1 : pageNumber + 2}
        onPageChange={(newPage) => setPageNumber(newPage)}
      />

      {/* Filter Drawer Component */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
        colors={colors}
        selectedCategories={selectedCategories}
        setSelectedCategories={(ids) => {
          setSelectedCategories(ids);
          setPageNumber(0);
        }}
        selectedColors={selectedColors}
        setSelectedColors={(ids) => {
          setSelectedColors(ids);
          setPageNumber(0);
        }}
        newArrival={newArrival}
        setNewArrival={(val) => {
          setNewArrival(val);
          setPageNumber(0);
        }}
        saleOnly={saleOnly}
        setSaleOnly={(val) => {
          setSaleOnly(val);
          setPageNumber(0);
        }}
        leastPrice={leastPrice}
        setLeastPrice={(val) => {
          setLeastPrice(val);
          setPageNumber(0);
        }}
        maxPrice={maxPrice}
        setMaxPrice={(val) => {
          setMaxPrice(val);
          setPageNumber(0);
        }}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default AllProduct;