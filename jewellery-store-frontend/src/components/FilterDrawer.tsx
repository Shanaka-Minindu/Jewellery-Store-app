'use client';

import React from 'react';
import { CategoryResDto } from '@/types/category';
import { MasterColor } from '@/types/product';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryResDto[];
  colors: MasterColor[];
  selectedCategories: number[];
  setSelectedCategories: (ids: number[]) => void;
  selectedColors: number[];
  setSelectedColors: (ids: number[]) => void;
  newArrival: boolean;
  setNewArrival: (val: boolean) => void;
  saleOnly: boolean;
  setSaleOnly: (val: boolean) => void;
  leastPrice: string;
  setLeastPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  onReset: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  colors,
  selectedCategories,
  setSelectedCategories,
  selectedColors,
  setSelectedColors,
  newArrival,
  setNewArrival,
  saleOnly,
  setSaleOnly,
  leastPrice,
  setLeastPrice,
  maxPrice,
  setMaxPrice,
  onReset,
}) => {
  const toggleCategory = (id: number) => {
    setSelectedCategories(
      selectedCategories.includes(id)
        ? selectedCategories.filter((cId) => cId !== id)
        : [...selectedCategories, id]
    );
  };

  const toggleColor = (id: number) => {
    setSelectedColors(
      selectedColors.includes(id)
        ? selectedColors.filter((cId) => cId !== id)
        : [...selectedColors, id]
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col justify-between bg-white p-6 overflow-y-auto">
        <div className="space-y-6">
          <SheetHeader className="border-b border-gray-200 pb-4 text-left">
            <SheetTitle className="text-lg font-bold text-gray-900">Filters</SheetTitle>
            <SheetDescription className="text-xs text-gray-500">
              Narrow down jewelry pieces by category, color, or price range.
            </SheetDescription>
          </SheetHeader>

          {/* Quick Toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">New Arrivals Only</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saleOnly}
                onChange={(e) => setSaleOnly(e.target.checked)}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Sale & Discount Items Only</span>
            </label>
          </div>

          {/* Price Range */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700">Price Range (Rs)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Price"
                value={leastPrice}
                onChange={(e) => setLeastPrice(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cat.title} ({cat.gender})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700">Colors</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((col) => {
                const isSelected = selectedColors.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleColor(col.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-black bg-gray-100 font-bold text-gray-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: col.colorCode }}
                    />
                    {col.colorName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <SheetFooter className="border-t border-gray-200 pt-4 flex flex-row gap-3 mt-6 sm:justify-between">
          <button
            type="button"
            onClick={onReset}
            className="w-1/2 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 text-sm transition-colors cursor-pointer"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 text-sm transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};