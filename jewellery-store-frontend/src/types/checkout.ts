export interface RevalidatedCartItemDto {
    variantId: number;
    productId: number;
    productTitle: string;
    colorName?: string;
    colorCode?: string;
    imageUrl?: string;
    sellingPrice: number;
    salePrice?: number;
    effectivePrice: number;
    availableQuantity: number;
    available: boolean;
    hidePrice: boolean;
  }
  
  export interface BillingAddressReqDto {
    firstName: string;
    lastName: string;
    address: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
    phone: string;
  }
  
  export interface CheckoutOrderItemReqDto {
    productId: number;
    variantId: number;
    variantColor: string;
    quantity: number;
    unitPrice: number;
  }
  
  export interface CheckoutOrderReqDto {
    email?: string;
    firstName: string;
    lastName: string;
    address: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
    phone: string;
    saveForNextTime: boolean;
    paymentType: 'ONLINE_GATEWAY' | 'CASH_ON_DELIVERY';
    discountCode?: string;
    useDifferentBillingAddress: boolean;
    billingAddress?: BillingAddressReqDto;
    items: CheckoutOrderItemReqDto[];
  }
  
  export interface CheckoutOrderResDto {
    orderId: number;
    orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    paymentType: 'ONLINE_GATEWAY' | 'CASH_ON_DELIVERY' | 'BANK_TRANSFER';
    deliveryFee: number;
    discountAmount: number;
    totalAmount: number;
    message: string;
  }