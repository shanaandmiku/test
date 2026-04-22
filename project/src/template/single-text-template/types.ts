import type { TextStyleFontWeight } from 'pixi.js'
import { z } from 'zod'

// 简单文本模板中的平铺文字字段
export type SimpleTextFields = {
  fill: string
  fontFamily: string
  fontSize: number
  fontWeight: TextStyleFontWeight
}

// 单个固定文本项
export type SimpleTextItem = SimpleTextFields & {
  slotId: string
  text: string
}

// 可重复文本组中的单个数据项
export type SimpleTextRepeatItem = SimpleTextFields & {
  groupId: string
  text: string
}

// 当前简单文本模板的数据源结构
export type SimpleTextTemplateDataSource = {
  config: Record<string, unknown>
  items: SimpleTextItem[]
  repeatItems: SimpleTextRepeatItem[]
}

// 模板中的单个文本槽位
export type TemplateTextSlot = {
  anchorX: number
  anchorY: number
  slotId: string
  xPercent: number
  yPercent: number
}

// 模板中的重复文本组布局
export type TemplateRepeatTextGroup = {
  anchorX: number
  anchorY: number
  direction: 'vertical'
  gapXPercent: number
  groupId: string
  startXPercent: number
  yPercent: number
}

export type SingleTextTemplateLayout = {
  id: 'single-text-template'
  repeatTextGroups: TemplateRepeatTextGroup[]
  textSlots: TemplateTextSlot[]
}

const simpleTextFieldsSchema = z.object({
  fill: z.string(),
  fontFamily: z.string(),
  fontSize: z.number(),
  fontWeight: z.union([
    z.literal('100'),
    z.literal('200'),
    z.literal('300'),
    z.literal('400'),
    z.literal('500'),
    z.literal('600'),
    z.literal('700'),
    z.literal('800'),
    z.literal('900'),
    z.literal('normal'),
    z.literal('bold'),
    z.literal('bolder'),
    z.literal('lighter'),
  ]),
})

export const simpleTextItemSchema = simpleTextFieldsSchema.extend({
  slotId: z.string(),
  text: z.string(),
})

export const simpleTextRepeatItemSchema = simpleTextFieldsSchema.extend({
  groupId: z.string(),
  text: z.string(),
})

export const simpleTextTemplateDataSourceSchema = z.object({
  config: z.record(z.string(), z.unknown()),
  items: z.array(simpleTextItemSchema),
  repeatItems: z.array(simpleTextRepeatItemSchema),
})

export const templateTextSlotSchema = z.object({
  anchorX: z.number(),
  anchorY: z.number(),
  slotId: z.string(),
  xPercent: z.number(),
  yPercent: z.number(),
})

export const templateRepeatTextGroupSchema = z.object({
  anchorX: z.number(),
  anchorY: z.number(),
  direction: z.literal('vertical'),
  gapXPercent: z.number(),
  groupId: z.string(),
  startXPercent: z.number(),
  yPercent: z.number(),
})

export const singleTextTemplateLayoutSchema = z.object({
  id: z.literal('single-text-template'),
  repeatTextGroups: z.array(templateRepeatTextGroupSchema),
  textSlots: z.array(templateTextSlotSchema),
})
