'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryResDto } from '@/types/category';
import { productService } from '@/services/productService';
import { colorService } from '@/services/colorService';
import { toast } from 'sonner';
import { Trash2, Upload, X, Plus } from 'lucide-react';
import { updateProductFormSchema, UpdateProductFormValues } from '@/schemas/updateProductSchema';
import { DetailedProductView, MasterColor } from '@/types/product';
import { UpdateProductReqDto, UpdateVariantReqDto, UpdateImageReqDto } from '@/types/updateProduct';

interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: DetailedProductView;
  categories: CategoryResDto[];
  onUpdateSuccess: (updatedProduct: DetailedProductView) => void;
}

interface SelectedColorVariantEdit {
  variantId?: number; // Existing variant ID if present
  colorId: number;
  colorName: string;
  colorCode: string;
  itemCode: string;
  quantity: string | number;
  sellingPrice: string | number;
  cost: string | number;
  discount: string | number;
  salePrice: string | number;
  isPrimaryVariant: boolean;
  // Files can be either existing URLs or newly uploaded File objects
  files: {
    id?: number; // Existing image ID if present
    file?: File;
    preview: string;
    isPrimary: boolean;
    imageUrl?: string; // S3 URL
  }[];
}

export const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onUpdateSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductFormSchema) as any,
  });

  const [masterColors, setMasterColors] = useState<MasterColor[]>([]);
  const [selectedColors, setSelectedColors] = useState<SelectedColorVariantEdit[]>([]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal State for adding a new global color
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');
  const [isCreatingColor, setIsCreatingColor] = useState(false);

  // Pre-populate form values and variants when product data changes or modal opens
  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description || '',
        productFor: product.productFor,
        size: product.size || '',
        isNewArrival: product.isNewArrival,
        hidePrice: product.hidePrice,
        categoryId: product.category?.id,
      });

      // Map existing variants and images into editing state
      const initialVariants: SelectedColorVariantEdit[] = product.variants.map((v) => ({
        variantId: v.id,
        colorId: v.color.id,
        colorName: v.color.colorName,
        colorCode: v.color.colorCode,
        itemCode: v.itemCode,
        quantity: v.quantity,
        sellingPrice: v.sellingPrice,
        cost: v.cost ?? '',
        discount: v.discount ?? '',
        salePrice: v.salePrice ?? '',
        isPrimaryVariant: v.isPrimary,
        files: v.images.map((img) => ({
          id: img.id,
          preview: img.imageUrl,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
        })),
      }));

      setSelectedColors(initialVariants);
      setActiveTabIdx(0);
    }
  }, [product, reset]);

  // Fetch available master colors
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
    if (isOpen) fetchColors();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectColor = (masterColor: MasterColor) => {
    if (selectedColors.some((c) => c.colorId === masterColor.id)) {
      toast.error('This color variant is already added.');
      return;
    }

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
    if (updated.length > 0 && !updated.some((c) => c.isPrimaryVariant)) {
      updated[0].isPrimaryVariant = true;
    }
    setSelectedColors(updated);
    if (activeTabIdx >= updated.length && updated.length > 0) {
      setActiveTabIdx(updated.length - 1);
    }
  };

  const handleVariantChange = (field: keyof SelectedColorVariantEdit, value: any) => {
    const updated = [...selectedColors];
    if (field === 'isPrimaryVariant' && value === true) {
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
      setIsColorModalOpen(false);
      setNewColorName('');
      setNewColorCode('#000000');
    } catch (error: any) {
      console.error(error);
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

  const onFormSubmit = async (formValues: UpdateProductFormValues) => {
    if (selectedColors.length === 0) {
      toast.error('Please configure at least one color variant with images.');
      return;
    }

    // Validate variants
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
        toast.error(`Please provide at least one image for color variant: ${variant.colorName}`);
        setActiveTabIdx(idx);
        return;
      }
    }

    setIsUpdating(true);
    const toastId = toast.loading('Uploading new images and updating product...');

    try {
      const formattedVariants: UpdateVariantReqDto[] = [];

      for (const colorGroup of selectedColors) {
        const processedImages: UpdateImageReqDto[] = [];

        for (const fileObj of colorGroup.files) {
          let imageUrl = fileObj.imageUrl;
          // If it's a newly added file, upload it to S3 first
          if (!imageUrl && fileObj.file) {
            imageUrl = await productService.uploadFileToS3(fileObj.file);
          }

          processedImages.push({
            id: fileObj.id, // Keeps existing ID so backend recognizes it
            imageUrl: imageUrl!,
            isPrimary: Boolean(fileObj.isPrimary),
          });
        }

        formattedVariants.push({
          id: colorGroup.variantId, // Keeps existing ID so backend recognizes it
          colorId: colorGroup.colorId,
          itemCode: colorGroup.itemCode.trim(),
          quantity: Number(colorGroup.quantity),
          sellingPrice: Number(colorGroup.sellingPrice),
          cost: colorGroup.cost !== '' ? Number(colorGroup.cost) : undefined,
          discount: colorGroup.discount !== '' ? Number(colorGroup.discount) : undefined,
          salePrice: colorGroup.salePrice !== '' ? Number(colorGroup.salePrice) : undefined,
          isPrimary: colorGroup.isPrimaryVariant,
          images: processedImages,
        });
      }

      const payload: UpdateProductReqDto = {
        ...formValues,
        variants: formattedVariants,
      };

      const updatedData = await productService.updateProduct(product.id, payload);
      toast.success('Product updated successfully!', { id: toastId });
      onUpdateSuccess(updatedData);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update product.', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const activeVariant = selectedColors[activeTabIdx];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Update Product: {product.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Product Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Title :</label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black outline-none"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Description :</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Product For, Is New Arrival, Hide Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product For :</label>
              <select
                {...register('productFor')}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 cursor-pointer"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="UNISEX">Unisex</option>
              </select>
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Category :</label>
              <select
                {...register('categoryId')}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title} ({cat.gender})
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
            </div>
          </div>

          {/* Color Management Section */}
          <div className="border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Color Variants Configuration :</h3>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Master Color
              </button>
            </div>

            {/* Master Colors Selection Palette */}
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

            {/* Selected Variants Pill List */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Active Variants:</p>
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

          {/* Variant Configuration Tabs & Form Fields */}
          {selectedColors.length > 0 && activeVariant && (
            <div className="space-y-6 border border-gray-200 rounded-2xl p-6 bg-gray-50/50">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                {selectedColors.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTabIdx(idx)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeTabIdx === idx ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {col.colorName} ({col.files.length} imgs)
                  </button>
                ))}
              </div>

              {/* Variant Fields */}
              <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity :</label>
                    <input
                      type="number"
                      value={activeVariant.quantity}
                      onChange={(e) => handleVariantChange('quantity', e.target.value)}
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
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount :</label>
                    <input
                      type="number"
                      step="0.01"
                      value={activeVariant.discount}
                      onChange={(e) => handleVariantChange('discount', e.target.value)}
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
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900"
                    />
                  </div>
                </div>

                {/* Primary Variant Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    checked={activeVariant.isPrimaryVariant}
                    onChange={(e) => handleVariantChange('isPrimaryVariant', e.target.checked)}
                    className="w-5 h-5 accent-black rounded cursor-pointer"
                    id={`update-primary-${activeTabIdx}`}
                  />
                  <label htmlFor={`update-primary-${activeTabIdx}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                    Set as Primary Variant (Default displayed card variant)
                  </label>
                </div>

                {/* Image Upload / Management Box */}
                <div className="border border-gray-200 rounded-2xl p-6 space-y-6">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{activeVariant.colorName} Variant Images</p>
                    <p className="text-xs text-gray-500">Manage existing images or upload new ones</p>
                  </div>

                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-sky-200 rounded-2xl p-6 bg-sky-50/30 hover:bg-sky-50 transition-all cursor-pointer">
                    <Upload className="w-8 h-8 text-sky-500 mb-2" />
                    <span className="text-sm font-semibold text-sky-600">Click to upload more images</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>

                  {/* Image Previews */}
                  <div className="space-y-3">
                    {activeVariant.files.map((fileObj, fIdx) => (
                      <div key={fIdx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <img src={fileObj.preview} alt="preview" className="w-12 h-12 object-cover rounded-lg border" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 truncate max-w-xs">{fileObj.imageUrl || fileObj.file?.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                            <input
                              type="radio"
                              name={`update-primary-img-${activeTabIdx}`}
                              checked={fileObj.isPrimary}
                              onChange={() => handleSetPrimaryImage(fIdx)}
                              className="accent-black"
                            />
                            Main Card Image
                          </label>
                          <button type="button" onClick={() => handleRemoveFile(fIdx)} className="text-red-500 hover:text-red-700 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? 'Updating Product...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Color Creation Modal */}
        {isColorModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Add New Master Color</h3>
                <button onClick={() => setIsColorModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black"
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
                    onClick={() => setIsColorModalOpen(false)}
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
    </div>
  );
};