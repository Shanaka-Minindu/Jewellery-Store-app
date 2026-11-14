'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryResDto } from '@/types/category';
import { productService } from '@/services/productService';
import { colorService } from '@/services/colorService';
import { toast } from 'sonner';
import { Trash2, Upload, X, Plus } from 'lucide-react';
import { productFormSchema } from '@/schemas/productSchema';
import { MasterColor, ProductColorReqDto, ProductFormValues, ProductReqDto } from '@/types/product';

interface AddProductProps {
  categories: CategoryResDto[];
  onSubmitAction: (data: ProductReqDto) => Promise<void>;
  isLoading: boolean;
}

interface SelectedColorVariant {
  colorId: number;
  colorName: string;
  colorCode: string;
  // Variant specific fields
  itemCode: string;
  quantity: string | number;
  sellingPrice: string | number;
  cost: string | number;
  discount: string | number;
  salePrice: string | number;
  isPrimaryVariant: boolean;
  files: { file: File; preview: string; isPrimary: boolean; uploadedUrl?: string }[];
}

export const AddProduct: React.FC<AddProductProps> = ({ categories, onSubmitAction, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      isNewArrival: false,
      hidePrice: false,
    },
  });

  const [masterColors, setMasterColors] = useState<MasterColor[]>([]);
  const [selectedColors, setSelectedColors] = useState<SelectedColorVariant[]>([]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Modal State for adding a new global color
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');
  const [isCreatingColor, setIsCreatingColor] = useState(false);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const data = await colorService.getColors();
        setMasterColors(data);
      } catch (error) {
        console.error('Failed to fetch colors', error);
        toast.error('Failed to load available colors.');
      }
    };
    fetchColors();
  }, []);

  const handleSelectColor = (masterColor: MasterColor) => {
    if (selectedColors.some((c) => c.colorId === masterColor.id)) {
      toast.error('This color is already added to the product.');
      return;
    }

    // If this is the first color being added, make it the primary variant by default
    const isFirst = selectedColors.length === 0;

    setSelectedColors([
      ...selectedColors,
      {
        colorId: masterColor.id,
        colorName: masterColor.colorName,
        colorCode: masterColor.colorCode,
        itemCode: '',
        quantity: '',
        sellingPrice: '',
        cost: '',
        discount: '',
        salePrice: '',
        isPrimaryVariant: isFirst,
        files: [],
      },
    ]);
  };

  const handleRemoveColor = (index: number) => {
    const updated = selectedColors.filter((_, i) => i !== index);
    // If we removed the primary variant, make sure another one becomes primary if available
    if (updated.length > 0 && !updated.some(c => c.isPrimaryVariant)) {
      updated[0].isPrimaryVariant = true;
    }
    setSelectedColors(updated);
    if (activeTabIdx >= updated.length && updated.length > 0) {
      setActiveTabIdx(updated.length - 1);
    }
  };

  const handleVariantChange = (field: keyof SelectedColorVariant, value: any) => {
    const updated = [...selectedColors];
    if (field === 'isPrimaryVariant' && value === true) {
      // Ensure only one variant is primary
      updated.forEach((c, idx) => {
        c.isPrimaryVariant = idx === activeTabIdx;
      });
    } else {
      updated[activeTabIdx] = { ...updated[activeTabIdx], [field]: value };
    }
    setSelectedColors(updated);
  };

  const handleSaveNewColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) {
      toast.error('Please enter a color name.');
      return;
    }

    setIsCreatingColor(true);
    try {
      const createdColor = await colorService.addColor({
        colorName: newColorName.trim(),
        colorCode: newColorCode,
      });

      setMasterColors([...masterColors, createdColor]);
      const isFirst = selectedColors.length === 0;
      setSelectedColors([
        ...selectedColors,
        {
          colorId: createdColor.id,
          colorName: createdColor.colorName,
          colorCode: createdColor.colorCode,
          itemCode: '',
          quantity: '',
          sellingPrice: '',
          cost: '',
          discount: '',
          salePrice: '',
          isPrimaryVariant: isFirst,
          files: [],
        },
      ]);

      toast.success('New color added successfully!');
      setIsModalOpen(false);
      setNewColorName('');
      setNewColorCode('#000000');
    } catch (error: any) {
      console.error('Failed to add color', error);
      toast.error(error.response?.data?.message || 'Failed to create color.');
    } finally {
      setIsCreatingColor(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);

    const newFileEntries = selectedFiles.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: selectedColors[activeTabIdx].files.length === 0 && idx === 0,
    }));

    const updatedColors = [...selectedColors];
    updatedColors[activeTabIdx].files = [...updatedColors[activeTabIdx].files, ...newFileEntries];
    setSelectedColors(updatedColors);
  };

  const handleRemoveFile = (fileIdx: number) => {
    const updatedColors = [...selectedColors];
    updatedColors[activeTabIdx].files = updatedColors[activeTabIdx].files.filter((_, i) => i !== fileIdx);
    setSelectedColors(updatedColors);
  };

  const handleSetPrimaryImage = (fileIdx: number) => {
    const updatedColors = [...selectedColors];
    updatedColors[activeTabIdx].files = updatedColors[activeTabIdx].files.map((f, i) => ({
      ...f,
      isPrimary: i === fileIdx,
    }));
    setSelectedColors(updatedColors);
  };

  const onFormSubmit = async (formValues: ProductFormValues) => {
    if (selectedColors.length === 0) {
      toast.error('Please select at least one color variant with images.');
      return;
    }

    // Validate variant fields
    for (const [idx, variant] of selectedColors.entries()) {
      if (!variant.itemCode.trim()) {
        toast.error(`Item Code is required for color variant: ${variant.colorName}`);
        setActiveTabIdx(idx);
        return;
      }
      if (variant.quantity === '' || Number(variant.quantity) < 0) {
        toast.error(`Valid quantity is required for color variant: ${variant.colorName}`);
        setActiveTabIdx(idx);
        return;
      }
      if (variant.sellingPrice === '' || Number(variant.sellingPrice) <= 0) {
        toast.error(`Valid selling price is required for color variant: ${variant.colorName}`);
        setActiveTabIdx(idx);
        return;
      }
      if (variant.files.length === 0) {
        toast.error(`Please upload at least one image for color variant: ${variant.colorName}`);
        setActiveTabIdx(idx);
        return;
      }
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading images to S3 and saving product...');

    try {
      const formattedColors: ProductColorReqDto[] = [];

      for (const colorGroup of selectedColors) {
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
          colorId: colorGroup.colorId,
          itemCode: colorGroup.itemCode.trim(),
          quantity: Number(colorGroup.quantity),
          sellingPrice: Number(colorGroup.sellingPrice),
          cost: colorGroup.cost !== '' ? Number(colorGroup.cost) : undefined,
          discount: colorGroup.discount !== '' ? Number(colorGroup.discount) : undefined,
          salePrice: colorGroup.salePrice !== '' ? Number(colorGroup.salePrice) : undefined,
          isPrimary: colorGroup.isPrimaryVariant,
          images: uploadedImages,
        });
      }

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

  const activeVariant = selectedColors[activeTabIdx];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-8 relative">
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

        {/* Product For, Is New Arrival, Hide Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
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
            {errors.productFor && <p className="text-xs text-red-500 mt-1">{errors.productFor.message}</p>}
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

        {/* Size & Category */}
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
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
          </div>
        </div>

        {/* Select Items Color Section */}
        <div className="border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Select Items Color :</h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add new
            </button>
          </div>

          {/* Render Master Colors Available for Selection */}
          <div className="flex flex-wrap gap-3 pt-2">
            {masterColors.map((col) => {
              const isSelected = selectedColors.some((sc) => sc.colorId === col.id);
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleSelectColor(col)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'border-black bg-gray-100 opacity-60' : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: col.colorCode }} />
                  <span className="font-medium text-sm text-gray-900">{col.colorName}</span>
                </button>
              );
            })}
          </div>

          {/* Render Currently Selected Colors with Delete Option */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Selected Color Variants:</p>
            <div className="flex flex-wrap gap-3">
              {selectedColors.map((col, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-xl bg-gray-50">
                  <span className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: col.colorCode }} />
                  <span className="font-medium text-sm text-gray-900">{col.colorName}</span>
                  {col.isPrimaryVariant && <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded">Primary</span>}
                  <button type="button" onClick={() => handleRemoveColor(idx)} className="text-gray-500 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Color-Specific Variant Details & Image Uploader Section */}
        {selectedColors.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 bg-gray-50">
            Please select at least one color above to configure variant details and images.
          </div>
        ) : (
          <div className="space-y-6 border border-gray-200 rounded-2xl p-6">
            {/* Color Tabs Header */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
              {selectedColors.map((col, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTabIdx === idx ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {col.colorName} Variant ({col.files.length} imgs)
                </button>
              ))}
            </div>

            {/* Active Variant Configuration Fields */}
            {activeVariant && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity :</label>
                    <input
                      type="number"
                      value={activeVariant.quantity}
                      onChange={(e) => handleVariantChange('quantity', e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price :</label>
                    <input
                      type="number"
                      step="0.01"
                      value={activeVariant.sellingPrice}
                      onChange={(e) => handleVariantChange('sellingPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Code :</label>
                    <input
                      type="text"
                      value={activeVariant.itemCode}
                      onChange={(e) => handleVariantChange('itemCode', e.target.value)}
                      placeholder="#NC001"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price :</label>
                    <input
                      type="number"
                      step="0.01"
                      value={activeVariant.salePrice}
                      onChange={(e) => handleVariantChange('salePrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 border-gray-200 border rounded-2xl p-6 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount :</label>
                    <input
                      type="number"
                      step="0.01"
                      value={activeVariant.discount}
                      onChange={(e) => handleVariantChange('discount', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost :</label>
                    <input
                      type="number"
                      step="0.01"
                      value={activeVariant.cost}
                      onChange={(e) => handleVariantChange('cost', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
                    />
                  </div>
                </div>

                {/* Set as Primary Variant Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    checked={activeVariant.isPrimaryVariant}
                    onChange={(e) => handleVariantChange('isPrimaryVariant', e.target.checked)}
                    className="w-5 h-5 accent-black rounded cursor-pointer"
                    id={`primary-variant-${activeTabIdx}`}
                  />
                  <label htmlFor={`primary-variant-${activeTabIdx}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                    Set as Primary Variant (Default displayed card variant)
                  </label>
                </div>

                {/* Active Tab Dropzone Box */}
                <div className="border border-gray-200 rounded-2xl p-6 space-y-6 mt-6">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{activeVariant.colorName} Color Product Images</p>
                    <p className="text-xs text-gray-500">Accepted file types: .png, .jpeg, .jpg</p>
                  </div>

                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-sky-200 rounded-2xl p-8 bg-sky-50/50 hover:bg-sky-50 transition-all cursor-pointer">
                    <Upload className="w-8 h-8 text-sky-500 mb-2" />
                    <span className="text-sm font-semibold text-sky-600">Click To Upload <span className="font-normal text-gray-600">or drag and drop</span></span>
                    <span className="text-xs text-gray-400 mt-1">Maximum file size: 5MB</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>

                  {/* Uploaded Files Preview List */}
                  <div className="space-y-3">
                    {activeVariant.files.map((fileObj, fIdx) => (
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
                              name={`primary-img-${activeTabIdx}`}
                              checked={fileObj.isPrimary}
                              onChange={() => handleSetPrimaryImage(fIdx)}
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

      {/* Popup Modal for Adding New Master Color */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Master Color</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewColor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Name :</label>
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="e.g. Rose Gold"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hex Code :</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColorCode}
                    onChange={(e) => setNewColorCode(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={newColorCode}
                    onChange={(e) => setNewColorCode(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingColor}
                  className="px-5 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingColor ? 'Saving...' : 'Save Color'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};