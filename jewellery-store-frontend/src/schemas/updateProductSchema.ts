import { z } from 'zod';

export const updateProductFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title is too long'),
  description: z.string().optional(),
  productFor: z.enum(['MALE', 'FEMALE', 'UNISEX'], {
    message: 'Please select a valid target gender',
  }),
  size: z.string().optional(),
  isNewArrival: z.boolean(),
  hidePrice: z.boolean(),
  categoryId: z.coerce.number().min(1, 'Category is required'),
});

export type UpdateProductFormValues = z.infer<typeof updateProductFormSchema>;