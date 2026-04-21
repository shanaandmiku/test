import type { TextStyleFontWeight } from 'pixi.js'
import type { CompiledNode, CompiledRectNode, CompiledTextNode } from '../type/type-b-c.ts'

type PercentViewport = {
  height: number
  width: number
}

export type PrefabTextStyle = {
  fill: string
  fontFamily: string
  fontSize: number
  fontWeight: TextStyleFontWeight
}

export type PrefabTextLine = {
  style: PrefabTextStyle
  text: string
  anchorX?: number
  anchorY?: number
  direction?: 'horizontal' | 'vertical'
  xPercent: number
  yPercent: number
}

export type PrefabLegendItem = {
  color: string
  label: string
}

export type PrefabLegendLayout = {
  markerHeight: number
  markerWidth: number
  startXPercent: number
  textGap: number
  xGap: number
  yPercent: number
}

export type PrefabGroupedColumnSeries = {
  color: string
  id: string
  label: string
}

export type PrefabGroupedColumnCategory = {
  id: string
  label: string
}

export type PrefabGroupedColumnPoint = {
  categoryId: string
  primaryValue: number
  secondaryValue: number
  seriesId: string
}

export type PrefabGroupedColumnChartLayout = {
  baselineColor: string
  baselineHeight: number
  barGap: number
  barTrackColor: string
  categoryGap: number
  categoryLabelYPercent: number
  chartHeightPercent: number
  chartWidthPercent: number
  dividerColor: string
  dividerHeight: number
  gridColor: string
  gridCount: number
  gridHeight: number
  labelStyle: PrefabTextStyle
  secondaryTextOffset: number
  secondaryValueStyle: PrefabTextStyle
  topValueOffset: number
  topValueStyle: PrefabTextStyle
  xPercent: number
  yPercent: number
}

export type PrefabRankingItem = {
  averageValue: number
  label: string
  lowValue: number
  subLabel: string
}

export type PrefabRankingBarLayout = {
  axisColor: string
  axisWidth: number
  barHeight: number
  barTrackColor: string
  bottomAxisYPercent: number
  chartHeightPercent: number
  chartWidthPercent: number
  gridColor: string
  gridWidth: number
  itemGap: number
  labelAreaWidthPercent: number
  labelStyle: PrefabTextStyle
  metricLabelStyle: PrefabTextStyle
  percentageLabelStyle: PrefabTextStyle
  primaryBarColor: string
  primaryValueStyle: PrefabTextStyle
  rowStartYPercent: number
  secondaryBarColor: string
  secondaryValueStyle: PrefabTextStyle
  subLabelOffset: number
  subLabelStyle: PrefabTextStyle
  valueOffset: number
  xPercent: number
}

const toX = (viewport: PercentViewport, xPercent: number): number => {
  return viewport.width * xPercent
}

const toY = (viewport: PercentViewport, yPercent: number): number => {
  return viewport.height * yPercent
}

// 创建统一文本节点
export const createTextNode = (
  viewport: PercentViewport,
  line: PrefabTextLine,
): CompiledTextNode => {
  return {
    type: 'text',
    anchorX: line.anchorX ?? 0,
    anchorY: line.anchorY ?? 0,
    direction: line.direction ?? 'horizontal',
    style: line.style,
    text: line.text,
    x: toX(viewport, line.xPercent),
    y: toY(viewport, line.yPercent),
  }
}

// 创建统一矩形节点
export const createRectNode = (input: {
  alpha?: number
  fill: string
  height: number
  width: number
  x: number
  y: number
}): CompiledRectNode => {
  return {
    type: 'rect',
    alpha: input.alpha,
    fill: input.fill,
    height: input.height,
    width: input.width,
    x: input.x,
    y: input.y,
  }
}

// 创建常用文本块
export const createTextBlockNodes = (
  viewport: PercentViewport,
  lines: PrefabTextLine[],
): CompiledTextNode[] => {
  return lines.map((line) => createTextNode(viewport, line))
}

// 创建图例行
export const createLegendRowNodes = (
  viewport: PercentViewport,
  layout: PrefabLegendLayout,
  items: PrefabLegendItem[],
  textStyle: PrefabTextStyle,
): CompiledNode[] => {
  let cursorX = toX(viewport, layout.startXPercent)
  const markerY = toY(viewport, layout.yPercent)
  const nodes: CompiledNode[] = []

  for (const item of items) {
    nodes.push(
      createRectNode({
        fill: item.color,
        height: layout.markerHeight,
        width: layout.markerWidth,
        x: cursorX,
        y: markerY - layout.markerHeight / 2,
      }),
    )

    const textX = cursorX + layout.markerWidth + layout.textGap

    nodes.push({
      type: 'text',
      anchorX: 0,
      anchorY: 0.5,
      direction: 'horizontal',
      style: textStyle,
      text: item.label,
      x: textX,
      y: markerY,
    })

    cursorX = textX + item.label.length * textStyle.fontSize + layout.xGap
  }

  return nodes
}

// 创建分组竖柱图
export const createGroupedColumnChartNodes = (
  viewport: PercentViewport,
  layout: PrefabGroupedColumnChartLayout,
  categories: PrefabGroupedColumnCategory[],
  series: PrefabGroupedColumnSeries[],
  points: PrefabGroupedColumnPoint[],
): CompiledNode[] => {
  const nodes: CompiledNode[] = []
  const chartX = toX(viewport, layout.xPercent)
  const chartY = toY(viewport, layout.yPercent)
  const chartWidth = viewport.width * layout.chartWidthPercent
  const chartHeight = viewport.height * layout.chartHeightPercent
  const chartBottom = chartY + chartHeight
  const maxPrimaryValue = Math.max(...points.map((point) => point.primaryValue), 1)
  const groupWidth =
    (chartWidth - layout.categoryGap * Math.max(categories.length - 1, 0)) /
    Math.max(categories.length, 1)
  const barWidth =
    (groupWidth - layout.barGap * Math.max(series.length - 1, 0)) /
    Math.max(series.length, 1)

  for (let index = 0; index < layout.gridCount; index += 1) {
    const progress = index / Math.max(layout.gridCount - 1, 1)
    const y = chartBottom - chartHeight * progress

    nodes.push(
      createRectNode({
        alpha: 0.7,
        fill: layout.gridColor,
        height: layout.gridHeight,
        width: chartWidth,
        x: chartX,
        y,
      }),
    )
  }

  for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
    const category = categories[categoryIndex]
    const groupX = chartX + categoryIndex * (groupWidth + layout.categoryGap)

    for (let seriesIndex = 0; seriesIndex < series.length; seriesIndex += 1) {
      const currentSeries = series[seriesIndex]
      const point = points.find((item) => {
        return (
          item.categoryId === category.id &&
          item.seriesId === currentSeries.id
        )
      })

      if (!point) {
        continue
      }

      const barX = groupX + seriesIndex * (barWidth + layout.barGap)
      const primaryHeight = (point.primaryValue / maxPrimaryValue) * chartHeight
      const secondaryHeight =
        (point.secondaryValue / maxPrimaryValue) * chartHeight
      const barY = chartBottom - primaryHeight
      const dividerY = chartBottom - secondaryHeight

      nodes.push(
        createRectNode({
          alpha: 0.25,
          fill: layout.barTrackColor,
          height: chartHeight,
          width: barWidth,
          x: barX,
          y: chartY,
        }),
      )

      nodes.push(
        createRectNode({
          fill: currentSeries.color,
          height: primaryHeight,
          width: barWidth,
          x: barX,
          y: barY,
        }),
      )

      nodes.push(
        createRectNode({
          alpha: 0.75,
          fill: layout.dividerColor,
          height: layout.dividerHeight,
          width: barWidth,
          x: barX,
          y: dividerY,
        }),
      )

      nodes.push({
        type: 'text',
        anchorX: 0.5,
        anchorY: 1,
        direction: 'horizontal',
        style: layout.topValueStyle,
        text: String(point.primaryValue),
        x: barX + barWidth / 2,
        y: barY - layout.topValueOffset,
      })

      nodes.push({
        type: 'text',
        anchorX: 0.5,
        anchorY: 1,
        direction: 'horizontal',
        style: layout.secondaryValueStyle,
        text: String(point.secondaryValue),
        x: barX + barWidth / 2,
        y: dividerY - layout.secondaryTextOffset,
      })
    }

    nodes.push({
      type: 'text',
      anchorX: 0.5,
      anchorY: 0,
      direction: 'horizontal',
      style: layout.labelStyle,
      text: category.label,
      x: groupX + groupWidth / 2,
      y: toY(viewport, layout.categoryLabelYPercent),
    })
  }

  nodes.push(
    createRectNode({
      fill: layout.baselineColor,
      height: layout.baselineHeight,
      width: chartWidth,
      x: chartX,
      y: chartBottom,
    }),
  )

  return nodes
}

// 创建横向排行条形图
export const createRankingBarChartNodes = (
  viewport: PercentViewport,
  layout: PrefabRankingBarLayout,
  items: PrefabRankingItem[],
  metricLabels: {
    left: string
    right: string
  },
): CompiledNode[] => {
  const nodes: CompiledNode[] = []
  const chartLeft = toX(viewport, layout.xPercent)
  const chartTop = toY(viewport, layout.rowStartYPercent)
  const labelAreaWidth = viewport.width * layout.labelAreaWidthPercent
  const chartWidth = viewport.width * layout.chartWidthPercent
  const valueAreaX = chartLeft + labelAreaWidth
  const maxPrimaryValue = Math.max(...items.map((item) => item.averageValue), 1)
  const gridCount = 6

  nodes.push(
    createRectNode({
      fill: layout.axisColor,
      height: viewport.height * layout.chartHeightPercent,
      width: layout.axisWidth,
      x: valueAreaX,
      y: chartTop - 10,
    }),
  )

  for (let index = 1; index < gridCount; index += 1) {
    const progress = index / (gridCount - 1)
    const x = valueAreaX + chartWidth * progress

    nodes.push(
      createRectNode({
        alpha: 0.45,
        fill: layout.gridColor,
        height: viewport.height * layout.chartHeightPercent,
        width: layout.gridWidth,
        x,
        y: chartTop - 10,
      }),
    )
  }

  nodes.push(
    ...createTextBlockNodes(viewport, [
      {
        anchorX: 0,
        anchorY: 1,
        style: layout.metricLabelStyle,
        text: metricLabels.left,
        xPercent: (valueAreaX + chartWidth * 0.18) / viewport.width,
        yPercent: layout.rowStartYPercent - 0.02,
      },
      {
        anchorX: 0,
        anchorY: 1,
        style: layout.metricLabelStyle,
        text: metricLabels.right,
        xPercent: (valueAreaX + chartWidth * 0.74) / viewport.width,
        yPercent: layout.rowStartYPercent - 0.02,
      },
    ]),
  )

  for (let index = 0; index <= gridCount - 1; index += 1) {
    const progress = index / (gridCount - 1)
    const x = valueAreaX + chartWidth * progress
    const label = index === 0 ? '0' : `${Math.round(progress * 100)}%`

    nodes.push({
      type: 'text',
      anchorX: 0.5,
      anchorY: 0,
      direction: 'horizontal',
      style: layout.percentageLabelStyle,
      text: label,
      x,
      y: toY(viewport, layout.bottomAxisYPercent),
    })
  }

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    const rowY = chartTop + index * (layout.barHeight + layout.itemGap)
    const primaryWidth = (item.averageValue / maxPrimaryValue) * chartWidth
    const secondaryWidth = (item.lowValue / maxPrimaryValue) * chartWidth

    nodes.push({
      type: 'text',
      anchorX: 0,
      anchorY: 0.5,
      direction: 'horizontal',
      style: layout.labelStyle,
      text: item.label,
      x: chartLeft,
      y: rowY + layout.barHeight * 0.28,
    })

    nodes.push({
      type: 'text',
      anchorX: 0,
      anchorY: 0.5,
      direction: 'horizontal',
      style: layout.subLabelStyle,
      text: item.subLabel,
      x: chartLeft,
      y: rowY + layout.barHeight * 0.28 + layout.subLabelOffset,
    })

    nodes.push(
      createRectNode({
        alpha: 0.16,
        fill: layout.barTrackColor,
        height: layout.barHeight,
        width: chartWidth,
        x: valueAreaX,
        y: rowY,
      }),
    )

    nodes.push(
      createRectNode({
        fill: layout.primaryBarColor,
        height: layout.barHeight,
        width: primaryWidth,
        x: valueAreaX,
        y: rowY,
      }),
    )

    nodes.push(
      createRectNode({
        fill: layout.secondaryBarColor,
        height: layout.barHeight,
        width: secondaryWidth,
        x: valueAreaX,
        y: rowY,
      }),
    )

    nodes.push({
      type: 'text',
      anchorX: 0,
      anchorY: 0.5,
      direction: 'horizontal',
      style: layout.secondaryValueStyle,
      text: String(item.lowValue),
      x: valueAreaX + secondaryWidth + layout.valueOffset,
      y: rowY + layout.barHeight / 2,
    })

    nodes.push({
      type: 'text',
      anchorX: 0,
      anchorY: 0.5,
      direction: 'horizontal',
      style: layout.primaryValueStyle,
      text: String(item.averageValue),
      x: valueAreaX + primaryWidth + layout.valueOffset,
      y: rowY + layout.barHeight / 2,
    })
  }

  return nodes
}
