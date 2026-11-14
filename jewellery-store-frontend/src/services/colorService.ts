import apiClient from '@/lib/axios';
import { MasterColor } from '@/types/product';

export const colorService = {
  getColors: async (): Promise<MasterColor[]> => {
    const response = await apiClient.get<MasterColor[]>('/getColors');
    return response.data;
  },

  addColor: async (colorData: { colorName: string; colorCode: string }): Promise<MasterColor> => {
    console.log(colorData);
    const response = await apiClient.post<MasterColor>('/addColor', colorData);
    return response.data;
  },
};