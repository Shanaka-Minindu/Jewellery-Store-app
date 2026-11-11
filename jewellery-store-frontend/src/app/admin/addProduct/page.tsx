'use client';

import React, { useEffect, useState } from 'react';
import { AddProduct } from '@/components/ui/admin/AddProduct';
import { CategoryResDto } from '@/types/category';

import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ProductReqDto } from '@/types/product';

export default function AddProductPage() {
  const [categories, setCategories] = useState<CategoryResDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Fetch categories on mount for the category dropdown selector
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to fetch product categories.');
      }
    };
    loadCategories();
  }, []);

  const handleProductSubmit = async (data: ProductReqDto) => {
    setIsLoading(true);
    try {
       
      await productService.createProduct(data);
      toast.success('Product created successfully with all color variants!');
      router.push('/admin/products'); // Redirect or clear as needed
    } catch (error: any) {
      console.error('Failed to create product:', error);
      throw error; // Handled within AddProduct component catch block
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <Toaster position="top-right" richColors />
      <div className="max-w-5xl mx-auto space-y-6">
        <AddProduct categories={categories} onSubmitAction={handleProductSubmit} isLoading={isLoading} />
      </div>
    </main>
  );
}