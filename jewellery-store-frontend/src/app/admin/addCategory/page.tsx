'use client';

import React, { useEffect, useState } from 'react';
import { CategoryReqDto, CategoryResDto } from '@/types/category';
import { categoryService } from '@/services/categoryService';
import { Toaster, toast } from 'sonner';

import apiClient from '@/lib/axios';
import AddCategory from '@/components/ui/admin/AddCategory';
import AllCategory from '@/components/ui/admin/AllCategory';

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryResDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  // Fetch all categories on mount
  const fetchCategories = async () => {
    try {
      setIsFetching(true);
      const response = await categoryService.fetchCategories();
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle category creation
  const handleCreateCategory = async (data: CategoryReqDto) => {
    setIsLoading(true);
    const toastId = toast.loading('Creating category...');

    try {
      const response = await categoryService.createCategory(data);
      toast.success(`Category "${response.title}" created successfully!`, {
        id: toastId,
      });
      // Refresh the category list
      await fetchCategories();
    } catch (error: any) {
      console.error('Failed to create category:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to create category. Please try again.';
      toast.error(errorMessage, {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: number) => {
    const toastId = toast.loading('Deleting category...');
    try {
      const data = await categoryService.deleteCategory(id);
      toast.success(data.message || 'Category deleted successfully', {
        id: toastId,
      });
      // Update state by removing deleted category item
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to delete category.';
      toast.error(errorMessage, {
        id: toastId,
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">

      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Category Management
        </h1>

        {/* Add Category Section */}
        <AddCategory onSubmitAction={handleCreateCategory} isLoading={isLoading} />

        {/* Display All Categories Section */}
        {isFetching ? (
          <div className="text-center py-8 text-gray-500">Loading categories...</div>
        ) : (
          <AllCategory
            AllCategoryData={categories}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </div>
    </main>
  );
}