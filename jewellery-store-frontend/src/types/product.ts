import { Gender } from "./category";

export interface ProductImageReqDto {
    imageUrl: string;
    isPrimary: boolean;
  }
  
  export interface ProductColorReqDto {
    colorName: string;
    colorCode?: string;
    images: ProductImageReqDto[];
  }

export interface ProductReqDto {
    title: string;
    description?: string;
    quantity: number;
    productFor: Gender;
    sellingPrice: number;
    size?: string;
    isNewArrival: boolean;
    hidePrice: boolean;
    discount?: number;
    salePrice?: number;
    categoryId: number;
    colors: ProductColorReqDto[];
  }

  export interface ProductFormValues {
    title: string;
    description?: string;
    quantity: number;
    productFor: 'MALE' | 'FEMALE' | 'UNISEX';
    categoryId: number;
    size?: string;
    sellingPrice: number;
    isNewArrival: boolean;
    hidePrice: boolean;
    discount?: number;
    salePrice?: number;
  }