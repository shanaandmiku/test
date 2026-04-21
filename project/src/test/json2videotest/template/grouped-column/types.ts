import { z } from 'zod'

const textStyleSchema = z.object({
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

export const groupedColumnDataSourceSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    }),
  ),
  config: z.object({
    brandText: z.string(),
    footerText: z.string(),
    subtitleText: z.string(),
    titleText: z.string(),
  }),
  points: z.array(
    z.object({
      categoryId: z.string(),
      primaryValue: z.number(),
      secondaryValue: z.number(),
      seriesId: z.string(),
    }),
  ),
  series: z.array(
    z.object({
      color: z.string(),
      id: z.string(),
      label: z.string(),
    }),
  ),
})

export const groupedColumnTemplateSchema = z.object({
  chartLayout: z.object({
    baselineColor: z.string(),
    baselineHeight: z.number(),
    barGap: z.number(),
    barTrackColor: z.string(),
    categoryGap: z.number(),
    categoryLabelYPercent: z.number(),
    chartHeightPercent: z.number(),
    chartWidthPercent: z.number(),
    dividerColor: z.string(),
    dividerHeight: z.number(),
    gridColor: z.string(),
    gridCount: z.number(),
    gridHeight: z.number(),
    labelStyle: textStyleSchema,
    secondaryTextOffset: z.number(),
    secondaryValueStyle: textStyleSchema,
    topValueOffset: z.number(),
    topValueStyle: textStyleSchema,
    xPercent: z.number(),
    yPercent: z.number(),
  }),
  id: z.literal('grouped-column-template'),
  legendLayout: z.object({
    markerHeight: z.number(),
    markerWidth: z.number(),
    startXPercent: z.number(),
    textGap: z.number(),
    xGap: z.number(),
    yPercent: z.number(),
  }),
  legendTextStyle: textStyleSchema,
  panel: z.object({
    alpha: z.number(),
    fill: z.string(),
    heightPercent: z.number(),
    widthPercent: z.number(),
    xPercent: z.number(),
    yPercent: z.number(),
  }),
  textLines: z.array(
    z.object({
      anchorX: z.number().optional(),
      anchorY: z.number().optional(),
      style: textStyleSchema,
      textKey: z.enum(['brandText', 'footerText', 'subtitleText', 'titleText']),
      xPercent: z.number(),
      yPercent: z.number(),
    }),
  ),
})

export type GroupedColumnDataSource = z.infer<
  typeof groupedColumnDataSourceSchema
>

export type GroupedColumnTemplate = z.infer<typeof groupedColumnTemplateSchema>
