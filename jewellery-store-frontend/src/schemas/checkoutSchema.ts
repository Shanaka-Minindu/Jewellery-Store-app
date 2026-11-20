import { z } from 'zod';

export const billingAddressSchema = z.object({
  firstName: z.string().trim().min(1, 'Billing first name is required').max(100),
  lastName: z.string().trim().min(1, 'Billing last name is required').max(100),
  address: z.string().trim().min(1, 'Billing address is required'),
  addressLine2: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().min(1, 'Billing city is required').max(100),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .min(9, 'Valid phone number is required')
    .max(10)
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
});

export const checkoutSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
    countryRegion: z.string().trim().min(1, 'Country/Region is required'),
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    address: z.string().trim().min(1, 'Address is required'),
    addressLine2: z.string().trim().optional().or(z.literal('')),
    city: z.string().trim().min(1, 'City is required').max(100),
    postalCode: z.string().trim().max(20).optional().or(z.literal('')),
    phone: z
      .string()
      .trim()
      .min(9, 'Phone number is required')
      .max(10)
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
    saveForNextTime: z.boolean().default(false),
    paymentType: z.enum(['ONLINE_GATEWAY', 'CASH_ON_DELIVERY']),
    useDifferentBillingAddress: z.boolean().default(false),
    billingAddress: billingAddressSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.useDifferentBillingAddress) {
      if (!data.billingAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide billing address details',
          path: ['billingAddress'],
        });
        return;
      }
      const parsedBilling = billingAddressSchema.safeParse(data.billingAddress);
      if (!parsedBilling.success) {
        for (const issue of parsedBilling.error.issues) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ['billingAddress', ...issue.path],
          });
        }
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;