import { CategoryResDto } from '@/types/category';
import React from 'react';
import { CategoryItem } from './CategoryItem';

interface AllCategoryProps {
  AllCategoryData: CategoryResDto[];
  onDeleteCategory: (id: number) => Promise<void>;
  isLoadingCategories?: boolean;
}

const AllCategory = ({ AllCategoryData, onDeleteCategory, isLoadingCategories = false }: AllCategoryProps) => {
  return (
    <div className="w-full space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>

      {AllCategoryData.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500 shadow-sm">
          No categories found. Create one above to get started.
        </div>
      ) : (
        AllCategoryData.map((category) => (
          <CategoryItem
            key={category.id}
            data={category}
            isLoadingCategories={isLoadingCategories}
            onDelete={onDeleteCategory}
          />
        ))
      )}
    </div>
  );
};

export default AllCategory;