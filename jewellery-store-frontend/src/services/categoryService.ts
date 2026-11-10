import apiClient from '@/lib/axios';
import { CategoryReqDto, CategoryResDto } from '@/types/category';

export const categoryService = {
  createCategory: async (data: CategoryReqDto): Promise<CategoryResDto> => {
    const response = await apiClient.post<CategoryResDto>('/addcategory', data);
    return response.data;
  },
};