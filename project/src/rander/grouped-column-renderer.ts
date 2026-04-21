import gsap from 'gsap'
import { Application, Container, Graphics, Text } from 'pixi.js'

import type { ProjectChartCategory, ProjectChartPoint, ProjectChartSeries, ProjectRecord } from '../project/project-model'
import { drawBackground } from './shared/pixi-background'
import { clamp, drawDashedLine } from './shared/pixi-graphics'
import type { PreviewProjectSnapshot, PreviewTemplateScene } from './shared/pixi-scene'
import { applyProjectText, createProjectText } from './shared/pixi-text'

type GroupedBarMetric = {
  category: ProjectChartCategory
  categoryIndex: number
  id: string
  primaryValue: number
  secondaryValue: number
  series: ProjectChartSeries
  seriesIndex: number
}

type GroupedBarNode = {
  divider: Graphics
  fill: Graphics
  metric: GroupedBarMetric
  secondaryValue: Text
  state: {
    reveal: number
  }
  topValue: Text
  track: Graphics
}

type GroupedLegendNode = {
  label: Text
  marker: Graphics
  series: ProjectChartSeries
}

// 创建分组竖柱模板渲染场景。
export function createGroupedColumnRenderer(
  pixiApp: Application,
  initialSnapshot: PreviewProjectSnapshot,
): PreviewTemplateScene {
  const root = new Container()
  const backdrop = new Graphics()
  const chartPanel = new Graphics()
  const header = new Container()
  const topRight = new Container()
  const legendLayer = new Container()
  const chartGrid = new Graphics()
  const chartBaseline = new Graphics()
  const barsLayer = new Container()
  const categoryLayer = new Container()
  const footer = createProjectText(initialSnapshot.project.content.footer)
  const eyebrow = createProjectText(initialSnapshot.project.content.eyebrow)
  const title = createProjectText(initialSnapshot.project.content.title)
  const subtitle = createProjectText(initialSnapshot.project.content.subtitle)
  const bars: GroupedBarNode[] = []
  const legendNodes: GroupedLegendNode[] = []
  const categoryLabels: Text[] = []
  let currentSnapshot = initialSnapshot
  let categoryCount = Math.max(initialSnapshot.project.data.categories.length, 1)
  let seriesCount = Math.max(initialSnapshot.project.chart.series.length, 1)
  let chartMaxValue = 100

  header.addChild(title, subtitle)
  topRight.addChild(eyebrow, legendLayer)
  root.addChild(
    backdrop,
    chartPanel,
    chartGrid,
    chartBaseline,
    header,
    barsLayer,
    categoryLayer,
    footer,
    topRight,
  )
  pixiApp.stage.addChild(root)

  // 同步柱状图节点数量和对应数据。
  const syncBars = (project: ProjectRecord) => {
    const metrics = buildGroupedBarMetrics(project)
    chartMaxValue = getChartMaxValue(metrics)

    while (bars.length < metrics.length) {
      const nextMetric = metrics[bars.length]

      if (!nextMetric) {
        break
      }

      bars.push(createBarNode(barsLayer, nextMetric, project))
    }

    while (bars.length > metrics.length) {
      const bar = bars.pop()

      if (bar) {
        destroyBarNode(barsLayer, bar)
      }
    }

    bars.forEach((bar, index) => {
      const nextMetric = metrics[index]

      if (!nextMetric) {
        return
      }

      bar.metric = nextMetric
      bar.state.reveal = 0
      bar.track.alpha = 0
      bar.topValue.alpha = 0
      bar.secondaryValue.alpha = 0
      bar.topValue.text = String(nextMetric.primaryValue)
      bar.secondaryValue.text = String(nextMetric.secondaryValue)
    })
  }

  // 同步图例节点。
  const syncLegend = (project: ProjectRecord) => {
    const { series } = project.chart
    seriesCount = Math.max(series.length, 1)

    while (legendNodes.length < series.length) {
      const nextSeries = series[legendNodes.length]

      if (!nextSeries) {
        break
      }

      legendNodes.push(createLegendNode(legendLayer, nextSeries))
    }

    while (legendNodes.length > series.length) {
      const legendNode = legendNodes.pop()

      if (!legendNode) {
        continue
      }

      legendLayer.removeChild(legendNode.marker, legendNode.label)
      legendNode.marker.destroy()
      legendNode.label.destroy()
    }

    legendNodes.forEach((legendNode, index) => {
      const nextSeries = series[index]

      if (!nextSeries) {
        return
      }

      legendNode.series = nextSeries
      legendNode.label.text = nextSeries.label
    })
  }

  // 同步底部分类标签。
  const syncCategoryLabels = (project: ProjectRecord) => {
    const { categories } = project.data
    categoryCount = Math.max(categories.length, 1)

    while (categoryLabels.length < categories.length) {
      const nextCategory = categories[categoryLabels.length]

      if (!nextCategory) {
        break
      }

      categoryLabels.push(createCategoryLabel(categoryLayer, nextCategory, project))
    }

    while (categoryLabels.length > categories.length) {
      const label = categoryLabels.pop()

      if (!label) {
        continue
      }

      categoryLayer.removeChild(label)
      label.destroy()
    }

    categoryLabels.forEach((label, index) => {
      const nextCategory = categories[index]

      if (!nextCategory) {
        return
      }

      label.text = nextCategory.label
    })
  }

  // 把最新项目配置写入当前场景。
  const applyProject = (snapshot: PreviewProjectSnapshot) => {
    currentSnapshot = snapshot
    applyProjectText(eyebrow, snapshot.project.content.eyebrow)
    applyProjectText(footer, snapshot.project.content.footer)
    applyProjectText(title, snapshot.project.content.title)
    applyProjectText(subtitle, snapshot.project.content.subtitle)

    subtitle.visible = snapshot.project.chart.template.kind === 'grouped-column'
      && snapshot.project.chart.template.showSubtitle
      && snapshot.project.content.subtitle !== undefined
      && snapshot.project.content.subtitle.content.trim().length > 0
    footer.visible = snapshot.project.chart.template.kind === 'grouped-column'
      && snapshot.project.chart.template.showFooter
      && snapshot.project.content.footer !== undefined
      && snapshot.project.content.footer.content.trim().length > 0
    legendLayer.visible = snapshot.project.chart.template.kind === 'grouped-column'
      && snapshot.project.chart.template.showLegend
      && snapshot.project.chart.series.length > 0
    topRight.visible = eyebrow.text.trim().length > 0 || legendLayer.visible

    syncLegend(snapshot.project)
    syncCategoryLabels(snapshot.project)
    syncBars(snapshot.project)
  }

  // 根据画面尺寸重新计算场景布局。
  const layout = (width: number, height: number) => {
    const { project, backgroundPreset } = currentSnapshot
    const paddingX = clamp(width * 0.065, 40, 88)
    const titleTop = clamp(height * 0.055, 30, 56)
    const footerBottom = clamp(height * 0.08, 44, 72)

    drawBackground(backdrop, width, height, backgroundPreset)

    title.x = paddingX
    title.y = titleTop
    subtitle.x = paddingX
    subtitle.y = title.y + title.height + 8

    eyebrow.x = width - paddingX - eyebrow.width
    eyebrow.y = titleTop + 8

    const legendGap = 28
    const markerSize = 14
    const totalLegendWidth = legendNodes.reduce((totalWidth, legendNode, index) => {
      const itemWidth = markerSize + 10 + legendNode.label.width
      return totalWidth + itemWidth + (index > 0 ? legendGap : 0)
    }, 0)
    const legendStartX = width - paddingX - totalLegendWidth
    const legendY = eyebrow.y + eyebrow.height + 22
    let cursorX = legendStartX

    legendNodes.forEach((legendNode) => {
      legendNode.marker
        .clear()
        .rect(cursorX, legendY + 4, markerSize, markerSize)
        .fill(legendNode.series.color)
      legendNode.label.x = cursorX + markerSize + 10
      legendNode.label.y = legendY - 2
      cursorX += markerSize + 10 + legendNode.label.width + legendGap
    })

    const subtitleHeight = subtitle.visible ? subtitle.height + 8 : 0
    const panelX = paddingX
    const panelY = title.y + title.height + subtitleHeight + clamp(height * 0.03, 20, 34)
    const panelWidth = width - paddingX * 2
    const footerHeight = footer.visible ? footer.height : 0
    const panelBottom = height - footerBottom - footerHeight - clamp(height * 0.05, 28, 44)
    const panelHeight = Math.max(panelBottom - panelY, 280)

    chartPanel
      .clear()
      .rect(panelX, panelY, panelWidth, panelHeight)
      .fill({ color: project.chart.style.panelFill, alpha: project.chart.style.panelAlpha })

    const chartPaddingX = clamp(width * 0.028, 28, 44)
    const chartLeft = panelX + chartPaddingX
    const chartRight = panelX + panelWidth - chartPaddingX
    const chartTop = panelY + clamp(height * 0.055, 36, 54)
    const chartBottom = panelY + panelHeight - clamp(height * 0.105, 72, 102)
    const chartHeight = Math.max(chartBottom - chartTop, 200)
    const chartWidth = Math.max(chartRight - chartLeft, 240)

    chartGrid.clear()
    for (let index = 0; index < 4; index += 1) {
      const y = chartTop + (chartHeight / 4) * index
      chartGrid
        .moveTo(chartLeft, y)
        .lineTo(chartRight, y)
        .stroke({
          color: project.chart.style.gridColor,
          width: 1,
          alpha: project.chart.style.gridAlpha,
        })
    }

    chartBaseline
      .clear()
      .moveTo(chartLeft, chartBottom)
      .lineTo(chartRight, chartBottom)
      .stroke({ color: project.chart.style.baselineColor, width: 2.5 })

    const groupWidth = chartWidth / categoryCount
    const barGap = clamp(width * 0.007, 10, 18)
    const maxBarWidth = (groupWidth - barGap * Math.max(seriesCount - 1, 0)) / seriesCount
    const barWidth = clamp(Math.min(groupWidth * 0.18, maxBarWidth), 34, 74)
    const totalBarsWidth = barWidth * seriesCount + barGap * Math.max(seriesCount - 1, 0)

    bars.forEach((bar) => {
      const groupStartX = chartLeft + groupWidth * bar.metric.categoryIndex + (groupWidth - totalBarsWidth) / 2
      const x = groupStartX + (barWidth + barGap) * bar.metric.seriesIndex
      const normalizedPrimaryValue = chartMaxValue > 0 ? bar.metric.primaryValue / chartMaxValue : 0
      const normalizedSecondaryValue = chartMaxValue > 0
        ? Math.min(bar.metric.secondaryValue, bar.metric.primaryValue) / chartMaxValue
        : 0
      const fillHeight = Math.max(chartHeight * normalizedPrimaryValue * bar.state.reveal, 0)
      const barTop = chartBottom - fillHeight
      const dividerY = chartBottom - chartHeight * normalizedSecondaryValue * bar.state.reveal
      const textAlpha = clamp((bar.state.reveal - 0.3) / 0.4, 0, 1)

      bar.track
        .clear()
        .rect(x, chartTop, barWidth, chartHeight)
        .fill({
          color: project.chart.style.trackColor,
          alpha: project.chart.style.trackAlpha,
        })

      if (fillHeight > 0) {
        bar.fill
          .clear()
          .rect(x, barTop, barWidth, fillHeight)
          .fill(bar.metric.series.color)
      } else {
        bar.fill.clear()
      }

      bar.divider.clear()
      if (bar.metric.secondaryValue > 0 && dividerY <= chartBottom) {
        drawDashedLine(bar.divider, x + 6, dividerY, barWidth - 12, 4, 4, 0xffffff, 0.72)
      }

      bar.track.alpha = clamp(bar.state.reveal * 1.2, 0, 1)
      bar.topValue.text = String(bar.metric.primaryValue)
      bar.topValue.style.fill = project.chart.style.valueColor
      bar.topValue.x = x + barWidth / 2
      bar.topValue.y = Math.max(chartTop + 18, barTop - 24)
      bar.topValue.alpha = textAlpha

      bar.secondaryValue.text = String(bar.metric.secondaryValue)
      bar.secondaryValue.style.fill = project.chart.style.secondaryValueColor
      bar.secondaryValue.x = x + barWidth / 2
      bar.secondaryValue.y = clamp(dividerY - 20, chartTop + 22, chartBottom - 24)
      bar.secondaryValue.alpha = textAlpha
    })

    categoryLabels.forEach((label, index) => {
      label.style.fill = project.chart.style.labelColor
      label.x = chartLeft + groupWidth * index + groupWidth / 2
      label.y = chartBottom + 28
    })

    if (footer.visible) {
      footer.x = (width - footer.width) / 2
      footer.y = height - footerBottom - footer.height
    }
  }

  // 创建入场动画。
  const animate = () => {
    const sceneTimeline = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    })

    header.alpha = 0
    header.y = 12
    topRight.alpha = 0
    categoryLayer.alpha = 0
    footer.alpha = footer.visible ? 0 : 1

    sceneTimeline.to(header, { alpha: 1, duration: 0.55, y: 0 }, 0)
    sceneTimeline.to(topRight, { alpha: topRight.visible ? 1 : 0, duration: 0.45 }, 0.08)
    sceneTimeline.to(categoryLayer, { alpha: 1, duration: 0.4 }, 0.18)

    if (footer.visible) {
      sceneTimeline.to(footer, { alpha: 1, duration: 0.45 }, 0.24)
    }

    bars.forEach((bar, index) => {
      sceneTimeline.to(
        bar.track,
        {
          alpha: 1,
          duration: 0.2,
        },
        0.18 + index * 0.06,
      )

      sceneTimeline.to(
        bar.state,
        {
          duration: 0.82,
          onUpdate: () => {
            layout(pixiApp.renderer.width, pixiApp.renderer.height)
          },
          reveal: 1,
        },
        0.22 + index * 0.08,
      )
    })

    return sceneTimeline
  }

  applyProject(initialSnapshot)

  return {
    animate,
    applyProject,
    destroy: () => {
      pixiApp.stage.removeChild(root)
      root.destroy({ children: true })
    },
    layout,
  }
}

// 根据分类和系列顺序构建柱状图条目。
function buildGroupedBarMetrics(project: ProjectRecord): GroupedBarMetric[] {
  const template = project.chart.template.kind === 'grouped-column' ? project.chart.template : null
  const pointMap = new Map<string, ProjectChartPoint>()

  project.data.points.forEach((point) => {
    pointMap.set(`${point.categoryId}:${point.seriesId ?? ''}`, point)
  })

  return project.data.categories.flatMap((category, categoryIndex) =>
    project.chart.series.map((series, seriesIndex) => {
      const point = pointMap.get(`${category.id}:${series.id}`)

      return {
        category,
        categoryIndex,
        id: `${category.id}:${series.id}`,
        primaryValue: getMetricValue(point, template?.primaryMetricId),
        secondaryValue: getMetricValue(point, template?.secondaryMetricId),
        series,
        seriesIndex,
      }
    }),
  )
}

// 计算柱状图坐标上限。
function getChartMaxValue(metrics: GroupedBarMetric[]): number {
  const maxPrimaryValue = Math.max(...metrics.map((metric) => metric.primaryValue), 100)
  const step = maxPrimaryValue > 400 ? 100 : 50

  return Math.ceil(maxPrimaryValue / step) * step
}

// 创建单个对比柱节点。
function createBarNode(
  barsLayer: Container,
  metric: GroupedBarMetric,
  project: ProjectRecord,
): GroupedBarNode {
  const track = new Graphics()
  const fill = new Graphics()
  const divider = new Graphics()
  const topValue = new Text({
    text: '0',
    anchor: 0.5,
    style: {
      fill: project.chart.style.valueColor,
      fontFamily: 'Space Grotesk',
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: 0,
    },
  })
  const secondaryValue = new Text({
    text: '0',
    anchor: 0.5,
    style: {
      fill: project.chart.style.secondaryValueColor,
      fontFamily: 'Space Grotesk',
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 0,
    },
  })

  track.alpha = 0
  topValue.alpha = 0
  secondaryValue.alpha = 0
  barsLayer.addChild(track, fill, divider, topValue, secondaryValue)

  return {
    divider,
    fill,
    metric,
    secondaryValue,
    state: {
      reveal: 0,
    },
    topValue,
    track,
  }
}

// 销毁单个柱子的渲染节点。
function destroyBarNode(barsLayer: Container, bar: GroupedBarNode): void {
  barsLayer.removeChild(bar.track, bar.fill, bar.divider, bar.topValue, bar.secondaryValue)
  bar.track.destroy()
  bar.fill.destroy()
  bar.divider.destroy()
  bar.topValue.destroy()
  bar.secondaryValue.destroy()
}

// 创建单个图例项。
function createLegendNode(legendLayer: Container, series: ProjectChartSeries): GroupedLegendNode {
  const marker = new Graphics()
  const label = new Text({
    text: series.label,
    style: {
      fill: 0xf1f5f9,
      fontFamily: 'IBM Plex Mono',
      fontSize: 16,
      fontWeight: '500',
      letterSpacing: 0,
    },
  })

  legendLayer.addChild(marker, label)

  return {
    label,
    marker,
    series,
  }
}

// 创建分类标签。
function createCategoryLabel(
  categoryLayer: Container,
  category: ProjectChartCategory,
  project: ProjectRecord,
): Text {
  const label = new Text({
    text: category.label,
    anchor: 0.5,
    style: {
      fill: project.chart.style.labelColor,
      fontFamily: 'Space Grotesk',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0,
      wordWrap: false,
    },
  })

  categoryLayer.addChild(label)

  return label
}

// 安全读取数据点上的指标值。
function getMetricValue(point: ProjectChartPoint | undefined, metricId?: string): number {
  if (!point || !metricId) {
    return 0
  }

  const value = point.values[metricId]

  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
