import { z } from 'zod'

export const kategoriSchema = z.object({
  name: z.string().trim().min(1, 'Kategori adı zorunlu').max(40, 'En fazla 40 karakter'),
  icon: z.string().trim().max(4, 'Tek emoji yeterli').optional().or(z.literal(''))
})

export const urunSchema = z.object({
  name: z.string().trim().min(1, 'Ürün adı zorunlu').max(80, 'En fazla 80 karakter'),
  categoryId: z.string().min(1, 'Kategori seç'),
  unit: z.enum(['adet', 'kg'], { errorMap: () => ({ message: 'Birim adet veya kg olmalı' }) })
})

export const siparisSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih'),
  location: z.string().trim().min(1, 'Şube adı zorunlu').max(60),
  note: z.string().trim().max(500).optional().or(z.literal(''))
})
