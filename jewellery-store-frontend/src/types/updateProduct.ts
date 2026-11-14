import { Gender } from './category';

export interface UpdateImageReqDto {
  id?: number; // Present if already saved in DB
  imageUrl: string;
  isPrimary: boolean;
}

export interface UpdateVariantReqDto {
  id?: number; // Present if already saved in DB
  itemCode: string;
  quantity: number;
  sellingPrice: number;
  cost?: number;
  discount?: number;
  salePrice?: number;
  isPrimary: boolean;
  colorId: number;
  images: UpdateImageReqDto[];
}

export interface UpdateProductReqDto {
  title: string;
  description?: string;
  productFor: Gender;
  size?: string;
  isNewArrival: boolean;
  hidePrice: boolean;
  categoryId: number;
  variants: UpdateVariantReqDto[];
}