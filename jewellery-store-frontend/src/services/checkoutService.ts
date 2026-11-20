
import apiClient from '@/lib/axios';
import {
  CheckoutOrderReqDto,
  CheckoutOrderResDto,
  RevalidatedCartItemDto,
} from '@/types/checkout';

export const checkoutService = {
  revalidateCart: async (variantIds: number[]): Promise<RevalidatedCartItemDto[]> => {
    const response = await apiClient.post<RevalidatedCartItemDto[]>('/checkout/revalidate', {
      variantIds,
    });
    return response.data;
  },

  placeOrder: async (payload: CheckoutOrderReqDto): Promise<CheckoutOrderResDto> => {
    const response = await apiClient.post<CheckoutOrderResDto>('/checkout/orders', payload);
    return response.data;
  },
};