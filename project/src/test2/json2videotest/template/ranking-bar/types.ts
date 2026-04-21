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

export const rankingBarDataSourceSchema = z.object({
  config: z.object({
    badgeText: z.string(),
    leftMetricLabel: z.string(),
    rightMetricLabel: z.string(),
    subtitleText: z.string(),
    titleText: z.string(),
  }),
  items: z.array(
    z.object({
      averageValue: z.number(),
      label: z.string(),
      lowValue: z.number(),
      subLabel: z.string(),
    }),
  ),
})

export const rankingBarTemplateSchema = z.object({
  backgroundBlocks: z.array(
    z.object({
      alpha: z.number(),
      fill: z.string(),
      heightPercent: z.number(),
      widthPercent: z.number(),
      xPercent: z.number(),
      yPercent: z.number(),
    }),
  ),
  badge: z.object({
    fill: z.string(),
    height: z.number(),
    width: z.number(),
    xPercent: z.number(),
    yPercent: z.number(),
  }),
  id: z.literal('ranking-bar-template'),
  rankingLayout: z.object({
    axisColor: z.string(),
    axisWidth: z.number(),
    barHeight: z.number(),
    barTrackColor: z.string(),
    bottomAxisYPercent: z.number(),
    chartHeightPercent: z.number(),
    chartWidthPercent: z.number(),
    gridColor: z.string(),
    gridWidth: z.number(),
    itemGap: z.number(),
    labelAreaWidthPercent: z.number(),
    labelStyle: textStyleSchema,
    metricLabelStyle: textStyleSchema,
    percentageLabelStyle: textStyleSchema,
    primaryBarColor: z.string(),
    primaryValueStyle: textStyleSchema,
    rowStartYPercent: z.number(),
    secondaryBarColor: z.string(),
    secondaryValueStyle: textStyleSchema,
    subLabelOffset: z.number(),
    subLabelStyle: textStyleSchema,
    valueOffset: z.number(),
    xPercent: z.number()
  }),
  textLines: z.array(
    z.object({
      anchorX: z.number().optional(),
      anchorY: z.number().optional(),
      style: textStyleSchema,
      textKey: z.enum([
        'badgeText',
        'leftMetricLabel',
        'rightMetricLabel',
        'subtitleText',
        'titleText',
      ]),
      xPercent: z.number(),
      yPercent: z.number(),
    }),
  ),
})

export type RankingBarDataSource = z.infer<typeof rankingBarDataSourceSchema>
export type RankingBarTemplate = z.infer<typeof rankingBarTemplateSchema>
