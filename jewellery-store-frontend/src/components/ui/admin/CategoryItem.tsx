'use client';

import React, { useState } from 'react';
import { CategoryResDto } from '@/types/category';
import { Trash2, Loader2 } from 'lucide-react';

interface CategoryItemProp {
  data: CategoryResDto;
  onDelete: (id: number) => Promise<void>;
  isLoadingCategories: boolean;
}

export const CategoryItem = ({ data, isLoadingCategories, onDelete }: CategoryItemProp) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete(data.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-all">
      {/* Category Title */}
      <div className="w-1/3 text-left">
        <span className="font-semibold text-gray-900 text-base">{data.title}</span>
      </div>

      {/* Gender */}
      <div className="w-1/3 text-center">
        <span className="text-gray-700 font-medium text-sm capitalize">
          {data.gender.toLowerCase()}
        </span>
      </div>

      {/* Product Count & Delete Icon */}
      <div className="w-1/3 flex items-center justify-end gap-8">
        <span className="text-gray-900 font-medium text-sm">
          {data.productCount} {data.productCount === 1 ? 'Product' : 'Products'}
        </span>

        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={isDeleting || isLoadingCategories}
          className="text-red-500 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50 p-1 rounded-lg hover:bg-red-50"
          title="Delete Category"
        >
          {isDeleting ? (
            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
