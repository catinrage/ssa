import { z } from 'zod';
import { type Prisma } from '@prisma/client';

export const registerToolSchema = z.object({
  name: z.string().min(1),
  diameter: z.number(),
  price: z.number().int(),
  durability: z.object({
    rough: z.number().int().default(0),
    finish: z.number().int().default(0),
    semiFinish: z.number().int().default(0),
    drilling: z.number().int().default(0),
    faceMilling: z.number().int().default(0),
  }),
}) satisfies z.Schema<Prisma.ToolUncheckedCreateInput>;