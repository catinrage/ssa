import { z } from 'zod';

export const updateGroupSchema = z.object({
  id: z.string(),
  price: z.number().int(),
  durability: z.object({
    rough: z.number().int().default(0),
    finish: z.number().int().default(0),
    semiFinish: z.number().int().default(0),
    drilling: z.number().int().default(0),
    faceMilling: z.number().int().default(0),
  }),
});
