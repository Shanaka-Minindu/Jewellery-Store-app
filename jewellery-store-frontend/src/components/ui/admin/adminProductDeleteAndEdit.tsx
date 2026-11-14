'use client';

import React, { useEffect, useState } from 'react';
import { UpdateProductModal } from '@/components/UpdateProductModal';
import { DetailedProductView } from '@/types/product';
import { CategoryResDto } from '@/types/category';
import { categoryService } from '@/services/categoryService';
import { useProductModalStore } from '@/store/useProductModalStore';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/services/productService';

interface AdminProductDeleteAndEditProps {
  productDetails: DetailedProductView;
  onProductUpdated?: (updated: DetailedProductView) => void;
  onProductDeleted?: (productId: number) => void;
}

export const AdminProductDeleteAndEdit: React.FC<AdminProductDeleteAndEditProps> = ({
  productDetails,
  onProductUpdated,
  onProductDeleted,
}) => {
  const { isUpdateOpen, openUpdateModal, closeUpdateModal } = useProductModalStore();
  const [categories, setCategories] = useState<CategoryResDto[]>([]);
  const [currentProduct, setCurrentProduct] = useState<DetailedProductView>(productDetails);

  // Fetch categories needed for the UpdateProductModal dropdown options
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  const handleUpdateSuccess = (updatedData: DetailedProductView) => {
    setCurrentProduct(updatedData);
    if (onProductUpdated) {
      onProductUpdated(updatedData);
    }
    toast.success('Product updated successfully view refreshed!');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${currentProduct.title}"?`)) {
      try {
        await productService.deleteProduct(currentProduct.id);
        toast.success('Product and S3 images deleted successfully!');
        if (onProductDeleted) {
          onProductDeleted(currentProduct.id);
        }
      } catch (error: any) {
        console.error('Failed to delete product', error);
        toast.error(error.response?.data?.message || 'Failed to delete product.');
      }
    }
  };
  return (
    <>
      {/* Action Buttons Container placed in the Right Corner */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={openUpdateModal}
          type="button"
          className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          title="Edit Product"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={handleDelete}
          type="button"
          className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Delete Product"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Update Product Modal Component */}
      <UpdateProductModal
        isOpen={isUpdateOpen}
        onClose={closeUpdateModal}
        product={currentProduct}
        categories={categories}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </>
  );
};

function deleteProduct(id: number) {
  throw new Error('Function not implemented.');
}
