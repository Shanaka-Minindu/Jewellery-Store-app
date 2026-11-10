'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryFormSchema, CategoryFormValues } from '@/schemas/categorySchema';
import { CategoryReqDto } from '@/types/category';

interface AddCategoryProps {
  onSubmitAction: (data: CategoryReqDto) => Promise<void>;
  isLoading: boolean;
}

function AddCategory ({ onSubmitAction, isLoading }:AddCategoryProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: '',
      gender: undefined,
    },
  });

  const handleFormSubmit = async (values: CategoryFormValues) => {
    await onSubmitAction(values);
    reset();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Create Category</h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Category Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Title :
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="Enter category name..."
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Gender Dropdown & Submit Button Container */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender :
            </label>
            <div className="relative">
              <select
                {...register('gender')}
                defaultValue=""
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all cursor-pointer"
              >
                <option value="" disabled>
                  Select gender...
                </option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="UNISEX">UNISEX</option>
              </select>
              {/* Custom dropdown arrow icon matching design */}
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center min-w-[180px]"
          >
            {isLoading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;