import { Gender } from "./category";

export interface MasterColor {
  id: number;
  colorName: string;
  colorCode: string;
}

export interface ProductImageReqDto {
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductColorReqDto {
  colorId: number;
  itemCode: string;
  quantity: number;
  sellingPrice: number;
  cost?: number;
  discount?: number;
  salePrice?: number;
  isPrimary: boolean;
  images: ProductImageReqDto[];
}

export interface ProductReqDto {
  title: string;
  description?: string;
  productFor: Gender;
  size?: string;
  isNewArrival: boolean;
  hidePrice: boolean;
  categoryId: number;
  colors: ProductColorReqDto[];
}

// Global form values no longer include variant-specific fields
export interface ProductFormValues {
  title: string;
  description?: string;
  productFor: 'MALE' | 'FEMALE' | 'UNISEX';
  categoryId: number;
  size?: string;
  isNewArrival: boolean;
  hidePrice: boolean;
}

export interface AllProductImageDto {
    id: number;
    imageUrl: string;
    is_Primary: boolean;
  }
  
  export interface AllProVariants {
    id: number;
    quantity: number;
    sellingPrice: number;
    discount?: number;
    salePrice?: number;
    colorName: string;
    colorCode: string;
  }
  
  export interface AllProductResDto {
    id: number;
    title: string;
    newArrival: boolean;
    hidePrice: boolean;
    primaryImg?: AllProductImageDto;
    secondaryImg?: AllProductImageDto;
    allProVariants: AllProVariants[];
  }

  export interface AllProductsReqWithFiltersDto {
  categoryIds?: number[];
  colorIds?: number[];
  newArrival?: boolean;
  leastPrice?: number;
  maxPrice?: number;
  saleOrDiscountItem?: boolean;
  searchKeyWord?: string;
  productsPerPage?: number;
  pageNumber?: number;
}

export interface MasterColor {
    id: number;
    colorName: string;
    colorCode: string;
  }
  
  export interface ProductImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
  }
  
  export interface ProductVariant {
    id: number;
    itemCode: string;
    quantity: number;
    sellingPrice: number;
    cost?: number;
    discount?: number;
    salePrice?: number;
    isPrimary: boolean;
    color: MasterColor;
    images: ProductImage[];
  }
  
  export interface ReviewUser {
    id: number;
    name?: string;
    email?: string;
  }
  
  export interface Review {
    id: number;
    user: ReviewUser;
    rating: number; // 1 to 5
    comment?: string;
    createdAt: string;
  }
  
  export interface DetailedProductView {
    id: number;
    title: string;
    description?: string;
    productFor: Gender;
    size: string;
    isNewArrival: boolean;
    hidePrice: boolean;
    category: {
      id: number;
      name: string;
      targetGender: Gender;
    };
    reviews: Review[];
    variants: ProductVariant[];
  }
  
  export interface CartItem {
    productId: number;
    productTitle: string;
    variantId: number;
    colorName: string;
    size:string;
    colorCode: string;
    price: number;
    quantity: number;
    image: string;
    maxStock: number;
  }