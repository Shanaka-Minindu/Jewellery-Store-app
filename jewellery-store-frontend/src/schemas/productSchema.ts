import { z } from 'zod';

export const productFormSchema = z.object({
  title: z.string().min(2, 'Product title must be at least 2 characters').max(150),
  description: z.string().optional(),
  productFor: z.enum(['MALE', 'FEMALE', 'UNISEX']),
  categoryId: z.coerce.number().min(1, 'Please select a valid category'),
  size: z.string().optional(),
  isNewArrival: z.boolean().default(false),
  hidePrice: z.boolean().default(false),
});