import apiClient from '@/lib/axios';
import { BasicRes, CategoryReqDto, CategoryResDto } from '@/types/category';

export const categoryService = {
  createCategory: async (data: CategoryReqDto): Promise<CategoryResDto> => {
    const response = await apiClient.post<CategoryResDto>('/addcategory', data);
    return response.data;
  },
  fetchCategories: async():Promise<CategoryResDto[]> =>{
    const response = await apiClient.get<CategoryResDto[]>('/categories');
    return response.data;
  },
  deleteCategory: async(id:number):Promise<BasicRes>=>{
    const response = await apiClient.delete(`/category/${id}`);
    return response.data;
  }
  
};