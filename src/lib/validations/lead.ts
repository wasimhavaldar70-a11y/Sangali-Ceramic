import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phone: z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  message: z.string().max(1000, "Message must be under 1000 characters").optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
