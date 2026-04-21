import gsap from 'gsap'
import { Application, Container, Graphics, Text } from 'pixi.js'

import type { ProjectChartCategory, ProjectChartPoint, ProjectRecord } from '../project/project-model'
import { drawBackground } from './shared/pixi-background'
import { clamp } from './shared/pixi-graphics'
import type { PreviewProjectSnapshot, PreviewTemplateScene } from './shared/pixi-scene'
import { applyProjectText, createProjectText } from './shared/pixi-text'

type RankingBarMetric = {
  category: ProjectChartCategory
  primaryValue: number
  secondaryValue: number
}

type RankingBarNode = {
  categoryLabel: Text
  metric: RankingBarMetric
  primaryFill: Graphics
  primaryValue: Text
  secondaryFill: Graphics
  secondaryValue: Text
  state: {
    reveal: number
  }
  subLabel: Text
  track: Graphics
}

// 创建横向排行模板渲染场景。
export function createRankingBarRenderer(
  pixiApp: Application,
  initialSnapshot: PreviewProjectSnapshot,
): PreviewTemplateScene {
  const root = new Container()
  const backdrop = new Graphics()
  const chartPanel = new Graphics()
  const gridLayer = new Graphics()
  const axisLabelsLayer = new Container()
  const barsLayer = new Container()
  const header = new Container()
  const metricHeaderLayer = new Container()
  const badge = createProjectText(initialSnapshot.project.content.badge)
  const title = createProjectText(initialSnapshot.project.content.title)
  const subtitle = createProjectText(initialSnapshot.project.content.subtitle)
  const barNodes: RankingBarNode[] = []
  const axisLabels: Text[] = []
  const metricHeaders = [
    new Text({
      text: '',
      style: {
        fill: 0xf5f5f5,
        fontFamily: 'IBM Plex Mono',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0,
      },
    }),
    new Text({
      text: '',
      style: {
        fill: 0xf5f5f5,
        fontFamily: 'IBM Plex Mono',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0,
      },
    }),
  ]
  let currentSnapshot = initialSnapshot
  let maxPrimaryValue = 100

  header.addChild(badge, title, subtitle)
  metricHeaders.forEach((label) => metricHeaderLayer.addChild(label))
  root.addChild(backdrop, chartPanel, gridLayer, axisLabelsLayer, barsLayer, metricHeaderLayer, header)
  pixiApp.stage.addChild(root)

  // 同步条形节点。
  const syncBars = (project: ProjectRecord) => {
    const metrics = buildRankingBarMetrics(project)
    maxPrimaryValue = Math.max(...metrics.map((metric) => metric.primaryValue), 1)

    while (barNodes.length < metrics.length) {
      const nextMetric = metrics[barNodes.length]

      if (!nextMetric) {
        break
      }

      barNodes.push(createRankingBarNode(barsLayer, nextMetric, project))
    }

    while (barNodes.length > metrics.length) {
      const node = barNodes.pop()

      if (!node) {
        continue
      }

      destroyRankingBarNode(barsLayer, node)
    }

    barNodes.forEach((node, index) => {
      const nextMetric = metrics[index]

      if (!nextMetric) {
        return
      }

      node.metric = nextMetric
      node.state.reveal = 0
      node.categoryLabel.text = nextMetric.category.label
      node.subLabel.text = nextMetric.category.subLabel ?? ''
      node.primaryValue.text = String(nextMetric.primaryValue)
      node.secondaryValue.text = String(nextMetric.secondaryValue)
      node.primaryValue.alpha = 0
      node.secondaryValue.alpha = 0
    })
  }

  // 同步底部刻度标签。
  const syncAxisLabels = (project: ProjectRecord) => {
    const scaleMarks = getScaleMarks(project, maxPrimaryValue)

    while (axisLabels.length < scaleMarks.length) {
      const label = new Text({
        text: '',
        anchor: 0.5,
        style: {
          fill: 0xd1d5db,
          fontFamily: 'IBM Plex Mono',
          fontSize: 14,
          fontWeight: '500',
          letterSpacing: 0,
        },
      })

      axisLabelsLayer.addChild(label)
      axisLabels.push(label)
    }

    while (axisLabels.length > scaleMarks.length) {
      const label = axisLabels.pop()

      if (!label) {
        continue
      }

      axisLabelsLayer.removeChild(label)
      label.destroy()
    }

    axisLabels.forEach((label, index) => {
      label.text = scaleMarks[index] ?? ''
    })
  }

  // 应用项目内容。
  const applyProject = (snapshot: PreviewProjectSnapshot) => {
    currentSnapshot = snapshot
    applyProjectText(badge, snapshot.project.content.badge)
    applyProjectText(title, snapshot.project.content.title)
    applyProjectText(subtitle, snapshot.project.content.subtitle)
    badge.visible = badge.text.trim().length > 0
    subtitle.visible = snapshot.project.chart.template.kind === 'ranking-bar'
      && snapshot.project.chart.template.showSubtitle
      && subtitle.text.trim().length > 0

    metricHeaders[0].text = getSecondaryMetricLabel(snapshot.project)
    metricHeaders[1].text = getPrimaryMetricLabel(snapshot.project)
    syncBars(snapshot.project)
    syncAxisLabels(snapshot.project)
  }

  // 重新布局场景。
  const layout = (width: number, height: number) => {
    const { project, backgroundPreset } = currentSnapshot
    const template = project.chart.template.kind === 'ranking-bar' ? project.chart.template : null
    const paddingX = clamp(width * 0.065, 46, 90)
    const headerTop = clamp(height * 0.05, 28, 52)

    drawBackground(backdrop, width, height, backgroundPreset)

    badge.x = paddingX
    badge.y = headerTop
    title.x = paddingX
    title.y = badge.visible ? badge.y + badge.height + 12 : headerTop
    subtitle.x = paddingX
    subtitle.y = title.y + title.height + 10

    const chartTop = subtitle.visible
      ? subtitle.y + subtitle.height + clamp(height * 0.06, 42, 72)
      : title.y + title.height + clamp(height * 0.06, 42, 72)
    const chartLeft = paddingX + clamp(width * 0.11, 120, 170)
    const chartRight = width - paddingX - 70
    const chartBottom = height - clamp(height * 0.11, 64, 96)
    const chartWidth = Math.max(chartRight - chartLeft, 320)
    const chartHeight = Math.max(chartBottom - chartTop, 240)
    const rowHeight = chartHeight / Math.max(barNodes.length, 1)
    const barHeight = Math.min(rowHeight * 0.42, 34)

    chartPanel
      .clear()
      .roundRect(
        paddingX - 18,
        chartTop - 36,
        width - (paddingX - 18) * 2,
        chartBottom - chartTop + 74,
        20,
      )
      .fill({
        color: project.chart.style.panelFill,
        alpha: project.chart.style.panelAlpha,
      })

    gridLayer.clear()
    for (let index = 0; index <= 5; index += 1) {
      const x = chartLeft + (chartWidth / 5) * index

      gridLayer
        .moveTo(x, chartTop - 14)
        .lineTo(x, chartBottom)
        .stroke({
          color: project.chart.style.gridColor,
          width: index === 0 ? 3 : 1,
          alpha: index === 0 ? 0.9 : project.chart.style.gridAlpha,
        })
    }

    metricHeaders[0].x = chartLeft + chartWidth * 0.34 - metricHeaders[0].width / 2
    metricHeaders[0].y = chartTop - 44
    metricHeaders[1].x = chartLeft + chartWidth * 0.82 - metricHeaders[1].width / 2
    metricHeaders[1].y = chartTop - 44

    barNodes.forEach((node, index) => {
      const rowCenterY = chartTop + rowHeight * index + rowHeight / 2
      const rowTop = rowCenterY - barHeight / 2
      const primaryRatio = resolveMetricRatio(project, node.metric.primaryValue, maxPrimaryValue)
      const secondaryRatio = resolveMetricRatio(project, node.metric.secondaryValue, maxPrimaryValue)
      const primaryWidth = chartWidth * primaryRatio * node.state.reveal
      const secondaryWidth = chartWidth * secondaryRatio * node.state.reveal

      node.categoryLabel.style.fill = project.chart.style.labelColor
      node.subLabel.style.fill = 0xd1d5db
      node.categoryLabel.x = paddingX
      node.categoryLabel.y = rowCenterY - 22
      node.subLabel.x = paddingX
      node.subLabel.y = rowCenterY + 4
      node.subLabel.visible = template?.showCategorySubLabel === true && node.subLabel.text.trim().length > 0

      node.track
        .clear()
        .roundRect(chartLeft, rowTop, chartWidth, barHeight, 4)
        .fill({
          color: project.chart.style.trackColor,
          alpha: 0.18,
        })

      node.primaryFill
        .clear()
        .roundRect(chartLeft, rowTop, primaryWidth, barHeight, 4)
        .fill(project.chart.style.accentColor)

      node.secondaryFill
        .clear()
        .roundRect(chartLeft, rowTop + 3, secondaryWidth, Math.max(barHeight - 6, 8), 4)
        .fill({
          color: project.chart.style.trackColor,
          alpha: project.chart.style.trackAlpha,
        })

      node.primaryValue.style.fill = project.chart.style.valueColor
      node.primaryValue.text = String(node.metric.primaryValue)
      node.primaryValue.x = chartLeft + primaryWidth + 12
      node.primaryValue.y = rowCenterY - node.primaryValue.height / 2
      node.primaryValue.alpha = clamp((node.state.reveal - 0.45) / 0.3, 0, 1)

      node.secondaryValue.style.fill = project.chart.style.secondaryValueColor
      node.secondaryValue.text = String(node.metric.secondaryValue)
      node.secondaryValue.x = chartLeft + secondaryWidth + 10
      node.secondaryValue.y = rowCenterY - node.secondaryValue.height / 2
      node.secondaryValue.alpha = clamp((node.state.reveal - 0.3) / 0.3, 0, 1)
    })

    const scaleMarks = getScaleMarks(project, maxPrimaryValue)

    axisLabels.forEach((label, index) => {
      label.text = scaleMarks[index] ?? ''
      label.x = chartLeft + (chartWidth / Math.max(scaleMarks.length - 1, 1)) * index
      label.y = chartBottom + 18
    })
  }

  // 创建入场动画。
  const animate = () => {
    const sceneTimeline = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    })

    header.alpha = 0
    header.y = 10
    metricHeaderLayer.alpha = 0
    axisLabelsLayer.alpha = 0

    sceneTimeline.to(header, { alpha: 1, duration: 0.55, y: 0 }, 0)
    sceneTimeline.to(metricHeaderLayer, { alpha: 1, duration: 0.3 }, 0.18)
    sceneTimeline.to(axisLabelsLayer, { alpha: 1, duration: 0.3 }, 0.22)

    barNodes.forEach((node, index) => {
      sceneTimeline.to(
        node.state,
        {
          duration: 0.72,
          onUpdate: () => {
            layout(pixiApp.renderer.width, pixiApp.renderer.height)
          },
          reveal: 1,
        },
        0.2 + index * 0.07,
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

// 构建排行模板的条目集合，默认按主指标降序。
function buildRankingBarMetrics(project: ProjectRecord): RankingBarMetric[] {
  const template = project.chart.template.kind === 'ranking-bar' ? project.chart.template : null
  const pointMap = new Map<string, ProjectChartPoint>()

  project.data.points.forEach((point) => {
    pointMap.set(point.categoryId, point)
  })

  return project.data.categories
    .map((category) => {
      const point = pointMap.get(category.id)

      return {
        category,
        primaryValue: getMetricValue(point, template?.primaryMetricId),
        secondaryValue: getMetricValue(point, template?.secondaryMetricId),
      }
    })
    .sort((left, right) => right.primaryValue - left.primaryValue)
}

// 创建单条排行节点。
function createRankingBarNode(
  barsLayer: Container,
  metric: RankingBarMetric,
  project: ProjectRecord,
): RankingBarNode {
  const track = new Graphics()
  const primaryFill = new Graphics()
  const secondaryFill = new Graphics()
  const categoryLabel = new Text({
    text: metric.category.label,
    style: {
      fill: project.chart.style.labelColor,
      fontFamily: 'Space Grotesk',
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: 0,
    },
  })
  const subLabel = new Text({
    text: metric.category.subLabel ?? '',
    style: {
      fill: 0xd1d5db,
      fontFamily: 'Space Grotesk',
      fontSize: 16,
      fontWeight: '500',
      letterSpacing: 0,
    },
  })
  const primaryValue = new Text({
    text: String(metric.primaryValue),
    style: {
      fill: project.chart.style.valueColor,
      fontFamily: 'Space Grotesk',
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: 0,
    },
  })
  const secondaryValue = new Text({
    text: String(metric.secondaryValue),
    style: {
      fill: project.chart.style.secondaryValueColor,
      fontFamily: 'Space Grotesk',
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 0,
    },
  })

  barsLayer.addChild(track, primaryFill, secondaryFill, categoryLabel, subLabel, primaryValue, secondaryValue)

  return {
    categoryLabel,
    metric,
    primaryFill,
    primaryValue,
    secondaryFill,
    secondaryValue,
    state: {
      reveal: 0,
    },
    subLabel,
    track,
  }
}

// 销毁单条排行节点。
function destroyRankingBarNode(barsLayer: Container, node: RankingBarNode): void {
  barsLayer.removeChild(
    node.track,
    node.primaryFill,
    node.secondaryFill,
    node.categoryLabel,
    node.subLabel,
    node.primaryValue,
    node.secondaryValue,
  )
  node.track.destroy()
  node.primaryFill.destroy()
  node.secondaryFill.destroy()
  node.categoryLabel.destroy()
  node.subLabel.destroy()
  node.primaryValue.destroy()
  node.secondaryValue.destroy()
}

// 读取当前主指标文案。
function getPrimaryMetricLabel(project: ProjectRecord): string {
  const template = project.chart.template.kind === 'ranking-bar' ? project.chart.template : null

  return project.chart.metrics.find((metric) => metric.id === template?.primaryMetricId)?.label ?? ''
}

// 读取当前次指标文案。
function getSecondaryMetricLabel(project: ProjectRecord): string {
  const template = project.chart.template.kind === 'ranking-bar' ? project.chart.template : null

  return project.chart.metrics.find((metric) => metric.id === template?.secondaryMetricId)?.label ?? ''
}

// 获取底部刻度标签。
function getScaleMarks(project: ProjectRecord, maxPrimaryValue: number): string[] {
  const template = project.chart.template.kind === 'ranking-bar' ? project.chart.template : null

  if (template?.scaleMode === 'absolute') {
    const step = Math.max(Math.ceil(maxPrimaryValue / 5), 1)

    return Array.from({ length: 6 }, (_, index) => String(step * index))
  }

  return ['0', '20%', '40%', '60%', '80%', '100%']
}

// 计算数值对应的显示比例。
function resolveMetricRatio(project: ProjectRecord, value: number, maxPrimaryValue: number): number {
  const template = project.chart.template.kind === 'ranking-bar' ? project.chart.template : null

  if (template?.scaleMode === 'absolute') {
    const absoluteMax = Math.max(maxPrimaryValue, 1)
    return value / absoluteMax
  }

  return value / Math.max(maxPrimaryValue, 1)
}

// 安全读取数据点上的指标值。
function getMetricValue(point: ProjectChartPoint | undefined, metricId?: string): number {
  if (!point || !metricId) {
    return 0
  }

  const value = point.values[metricId]

  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
