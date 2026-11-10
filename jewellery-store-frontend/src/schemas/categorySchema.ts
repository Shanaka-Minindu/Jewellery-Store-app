import { z } from 'zod';

export const categoryFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Category title must be at least 2 characters long' })
    .max(100, { message: 'Category title cannot exceed 100 characters' }),
  gender: z.enum(['MALE', 'FEMALE', 'UNISEX'], {
    message: 'Please select a valid target gender',
  }),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;