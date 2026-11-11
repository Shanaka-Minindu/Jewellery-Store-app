'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CategoryResDto } from '@/types/category';

import { productService } from '@/services/productService';
import { toast } from 'sonner';
import { Trash2, Upload, X } from 'lucide-react';
import { productFormSchema } from '@/schemas/productSchema';
import { ProductColorReqDto, ProductFormValues, ProductReqDto } from '@/types/product';

interface AddProductProps {
  categories: CategoryResDto[];
  onSubmitAction: (data: ProductReqDto) => Promise<void>;
  isLoading: boolean;
}

interface ColorVariantState {
  colorName: string;
  colorCode: string;
  files: { file: File; preview: string; isPrimary: boolean; uploadedUrl?: string }[];
}

export const AddProduct: React.FC<AddProductProps> = ({ categories, onSubmitAction, isLoading }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema) as any, // Cast resolver to 'any' to bypass strict Zod coercion generic mismatches
        defaultValues: {
          isNewArrival: false,
          hidePrice: false,
        },
      });

  // Color & Image management states
  const [colorsList, setColorsList] = useState<ColorVariantState[]>([]);
  const [currentColorName, setCurrentColorName] = useState('');
  const [currentColorCode, setCurrentColorCode] = useState('#000000');
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Add Color Handler
  const handleAddColor = () => {
    if (!currentColorName.trim()) {
      toast.error('Please enter a color name.');
      return;
    }
    if (colorsList.some((c) => c.colorName.toLowerCase() === currentColorName.trim().toLowerCase())) {
      toast.error('This color has already been added.');
      return;
    }

    setColorsList([
      ...colorsList,
      { colorName: currentColorName.trim(), colorCode: currentColorCode, files: [] },
    ]);
    setCurrentColorName('');
    setCurrentColorCode('#000000');
  };

  const handleRemoveColor = (index: number) => {
    const updated = colorsList.filter((_, i) => i !== index);
    setColorsList(updated);
    if (activeTabIdx >= updated.length && updated.length > 0) {
      setActiveTabIdx(updated.length - 1);
    }
  };

  // Handle local file selection for active color tab
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);

    const newFileEntries = selectedFiles.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      // Set first image as primary by default if none exists in this color group
      isPrimary: colorsList[activeTabIdx].files.length === 0 && idx === 0,
    }));

    const updatedColors = [...colorsList];
    updatedColors[activeTabIdx].files = [...updatedColors[activeTabIdx].files, ...newFileEntries];
    setColorsList(updatedColors);
  };

  const handleRemoveFile = (fileIdx: number) => {
    const updatedColors = [...colorsList];
    updatedColors[activeTabIdx].files = updatedColors[activeTabIdx].files.filter((_, i) => i !== fileIdx);
    setColorsList(updatedColors);
  };

  const handleSetPrimary = (fileIdx: number) => {
    const updatedColors = [...colorsList];
    updatedColors[activeTabIdx].files = updatedColors[activeTabIdx].files.map((f, i) => ({
      ...f,
      isPrimary: i === fileIdx,
    }));
    setColorsList(updatedColors);
  };

  // Final Form Submission Handler
  const onFormSubmit = async (formValues: ProductFormValues) => {
    if (colorsList.length === 0) {
      toast.error('Please add at least one color variant with images.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading images to S3 and saving product...');

    try {
      // 1. Upload all pending files directly to S3 and collect URLs
      const formattedColors: ProductColorReqDto[] = [];

      for (const colorGroup of colorsList) {
        const uploadedImages = [];
        for (const fileObj of colorGroup.files) {
          let fileUrl = fileObj.uploadedUrl;
          if (!fileUrl) {
            fileUrl = await productService.uploadFileToS3(fileObj.file);
          }
         
          uploadedImages.push({
            imageUrl: fileUrl,
            isPrimary: Boolean(fileObj.isPrimary),
          });
        }

        formattedColors.push({
          colorName: colorGroup.colorName,
          colorCode: colorGroup.colorCode,
          images: uploadedImages,
        });
      }

      // 2. Construct final payload
      const payload: ProductReqDto = {
        ...formValues,
        colors: formattedColors,
      };

      await onSubmitAction(payload);
      toast.success('Product created successfully!', { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create product.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Add Product</h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Product Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Title :</label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter product title..."
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Description :</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter description..."
          />
        </div>

        {/* Quantity, Is New Arrival, Hide Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity :</label>
            <input
              type="number"
              {...register('quantity')}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="text-sm font-medium text-gray-700">Is New Arrivals :</label>
            <input type="checkbox" {...register('isNewArrival')} className="w-5 h-5 accent-black rounded cursor-pointer" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <label className="text-sm font-medium text-gray-700">Hide Price :</label>
            <input type="checkbox" {...register('hidePrice')} className="w-5 h-5 accent-black rounded cursor-pointer" />
          </div>
        </div>

        {/* Product For & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product For :</label>
            <select
              {...register('productFor')}
              defaultValue=""
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 cursor-pointer"
            >
              <option value="" disabled>Select target gender...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Category :</label>
            <select
              {...register('categoryId')}
              defaultValue=""
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 cursor-pointer"
            >
              <option value="" disabled>Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title} ({cat.gender})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Size & Selling Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size :</label>
            <input
              type="text"
              {...register('size')}
              placeholder="e.g. 7, 8, Medium"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price :</label>
            <input
              type="number"
              step="0.01"
              {...register('sellingPrice')}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
            />
          </div>
        </div>

        {/* Discount & Sale Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount :</label>
            <input
              type="number"
              step="0.01"
              {...register('discount')}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price :</label>
            <input
              type="number"
              step="0.01"
              {...register('salePrice')}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
            />
          </div>
        </div>

        {/* Add Colors Section */}
        <div className="border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Colors :</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Color name :</label>
              <input
                type="text"
                value={currentColorName}
                onChange={(e) => setCurrentColorName(e.target.value)}
                placeholder="e.g. Rose Gold"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Hex Code :</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentColorCode}
                  onChange={(e) => setCurrentColorCode(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-1 bg-white"
                />
                <input
                  type="text"
                  value={currentColorCode}
                  onChange={(e) => setCurrentColorCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl uppercase"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddColor}
              className="w-full md:w-auto px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Render Added Color Badges */}
          <div className="flex flex-wrap gap-3 pt-2">
            {colorsList.map((col, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-xl bg-gray-50">
                <span className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: col.colorCode }} />
                <span className="font-medium text-sm text-gray-900">{col.colorName}</span>
                <button type="button" onClick={() => handleRemoveColor(idx)} className="text-gray-500 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Color-Specific Image Uploader Section */}
        {colorsList.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 bg-gray-50">
            Please add at least one color above to enable image uploads for your product variants.
          </div>
        ) : (
          <div className="space-y-4 border border-gray-200 rounded-2xl p-6">
            {/* Color Tabs Header */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
              {colorsList.map((col, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTabIdx === idx ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {col.colorName} Product Images ({col.files.length})
                </button>
              ))}
            </div>

            {/* Active Tab Dropzone Box */}
            <div className="border border-gray-200 rounded-2xl p-6 space-y-6">
              <div className="text-center">
                <p className="font-semibold text-gray-900">{colorsList[activeTabIdx]?.colorName} Color Product Images</p>
                <p className="text-xs text-gray-500">Accepted file types for this demo: .png, .jpeg, .jpg</p>
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-sky-200 rounded-2xl p-8 bg-sky-50/50 hover:bg-sky-50 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-sky-500 mb-2" />
                <span className="text-sm font-semibold text-sky-600">Click To Upload <span className="font-normal text-gray-600">or drag and drop</span></span>
                <span className="text-xs text-gray-400 mt-1">Maximum file size for this demo: 5MB</span>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>

              {/* Uploaded Files Preview List */}
              <div className="space-y-3">
                {colorsList[activeTabIdx]?.files.map((fileObj, fIdx) => (
                  <div key={fIdx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={fileObj.preview} alt="preview" className="w-12 h-12 object-cover rounded-lg border" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{fileObj.file.name}</p>
                        <p className="text-xs text-gray-500">{(fileObj.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="radio"
                          name={`primary-${activeTabIdx}`}
                          checked={fileObj.isPrimary}
                          onChange={() => handleSetPrimary(fIdx)}
                          className="accent-black"
                        />
                        Main Product Card Image
                      </label>
                      <button type="button" onClick={() => handleRemoveFile(fIdx)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-medium rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading || isUploading ? 'Creating Product...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};