// A 层和 B 层共享的运行配置
import { z } from 'zod'

export const Json2VideoRuntimeConfigSchema = z.object({
  background: z.union([z.number(), z.string()]),
  viewport: z.object({
    width: z.union([z.number(), z.string()]),
    height: z.union([z.number(), z.string()]),
  }),
})

export type Json2VideoRuntimeConfig = z.infer<
  typeof Json2VideoRuntimeConfigSchema
>
