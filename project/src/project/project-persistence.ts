import { isPlainObject } from '../util/common'
import type {
  ProjectChartCategory,
  ProjectChartConfig,
  ProjectChartMetric,
  ProjectChartPoint,
  ProjectChartSeries,
  ProjectChartStyleConfig,
  ProjectContentSlots,
  ProjectPageSettings,
  ProjectRecord,
  ProjectTemplateConfig,
  ProjectTemplateKind,
  ProjectTextContent,
  ProjectTextStyle,
} from './project-model'
import { createProjectRecord } from './project-factory'
import type { ProjectStoreState } from './project-store-types'

// 创建默认的项目仓库状态。
export function createDefaultProjectStoreState(): ProjectStoreState {
  const defaultProject = createProjectRecord('grouped-column', '市场周报图表')

  defaultProject.meta.summary = '多系列分组柱状对比'

  return {
    order: [defaultProject.meta.id],
    records: {
      [defaultProject.meta.id]: defaultProject,
    },
    selectedProjectId: defaultProject.meta.id,
  }
}

// 解析项目仓库存储内容。
export function parseProjectStore(rawValue: string): ProjectStoreState {
  const parsedValue = JSON.parse(rawValue) as unknown
  const fallbackState = createDefaultProjectStoreState()

  if (!isPlainObject(parsedValue) || !isPlainObject(parsedValue.records)) {
    return fallbackState
  }

  const records = Object.entries(parsedValue.records).reduce<Record<string, ProjectRecord>>(
    (result, [projectId, projectValue]) => {
      const nextProject = parseProjectRecord(projectValue)

      if (nextProject) {
        result[projectId] = nextProject
      }

      return result
    },
    {},
  )

  const order = Array.isArray(parsedValue.order)
    ? parsedValue.order.filter(
      (projectId): projectId is string => typeof projectId === 'string' && records[projectId] !== undefined,
    )
    : []

  const finalOrder = order.length > 0 ? order : Object.keys(records)

  if (finalOrder.length === 0) {
    return fallbackState
  }

  const selectedProjectId = typeof parsedValue.selectedProjectId === 'string'
    && finalOrder.includes(parsedValue.selectedProjectId)
    ? parsedValue.selectedProjectId
    : finalOrder[0]

  return {
    order: finalOrder,
    records,
    selectedProjectId,
  }
}

// 解析单个项目。
function parseProjectRecord(value: unknown): ProjectRecord | null {
  if (!isPlainObject(value)) {
    return null
  }

  const meta = parseProjectMeta(value.meta)
  const page = parseProjectPageSettings(value.page)
  const content = parseProjectContentSlots(value.content)
  const chart = parseProjectChartConfig(value.chart)
  const data = parseProjectDataSource(value.data)

  if (!meta || !page || !content || !chart || !data) {
    return null
  }

  return {
    chart,
    content,
    data,
    meta,
    page,
  }
}

// 解析项目元信息。
function parseProjectMeta(value: unknown): ProjectRecord['meta'] | null {
  if (!isPlainObject(value) || !isProjectTemplateKind(value.templateKind)) {
    return null
  }

  if (
    typeof value.id !== 'string'
    || typeof value.name !== 'string'
    || typeof value.summary !== 'string'
    || typeof value.updatedAt !== 'string'
  ) {
    return null
  }

  return {
    id: value.id,
    name: value.name,
    summary: value.summary,
    templateKind: value.templateKind,
    updatedAt: value.updatedAt,
  }
}

// 解析页面配置。
function parseProjectPageSettings(value: unknown): ProjectPageSettings | null {
  if (!isPlainObject(value)) {
    return null
  }

  if (
    typeof value.frameRate !== 'number'
    || !Number.isFinite(value.frameRate)
    || typeof value.resolutionId !== 'string'
  ) {
    return null
  }

  return {
    frameRate: value.frameRate,
    resolutionId: value.resolutionId,
  }
}

// 解析内容槽位。
function parseProjectContentSlots(value: unknown): ProjectContentSlots | null {
  if (!isPlainObject(value)) {
    return null
  }

  const title = parseProjectTextContent(value.title)

  if (!title) {
    return null
  }

  return {
    badge: parseOptionalProjectTextContent(value.badge),
    eyebrow: parseOptionalProjectTextContent(value.eyebrow),
    footer: parseOptionalProjectTextContent(value.footer),
    subtitle: parseOptionalProjectTextContent(value.subtitle),
    title,
    unitLabel: parseOptionalProjectTextContent(value.unitLabel),
  }
}

// 解析图表配置。
function parseProjectChartConfig(value: unknown): ProjectChartConfig | null {
  if (
    !isPlainObject(value)
    || !Array.isArray(value.metrics)
    || !Array.isArray(value.series)
  ) {
    return null
  }

  const metrics = value.metrics.filter(isProjectChartMetric)
  const series = value.series.filter(isProjectChartSeries)
  const style = parseProjectChartStyleConfig(value.style)
  const template = parseProjectTemplateConfig(value.template)

  if (metrics.length === 0 || !style || !template) {
    return null
  }

  return {
    metrics,
    series,
    style,
    template,
  }
}

// 解析原始数据源。
function parseProjectDataSource(value: unknown): ProjectRecord['data'] | null {
  if (
    !isPlainObject(value)
    || !Array.isArray(value.categories)
    || !Array.isArray(value.points)
  ) {
    return null
  }

  const categories = value.categories.filter(isProjectChartCategory)
  const points = value.points.filter(isProjectChartPoint)

  if (categories.length === 0) {
    return null
  }

  return {
    categories,
    points,
  }
}

// 解析文本内容。
function parseProjectTextContent(value: unknown): ProjectTextContent | null {
  if (!isPlainObject(value) || typeof value.content !== 'string') {
    return null
  }

  const style = parseProjectTextStyle(value.style)

  if (!style) {
    return null
  }

  return {
    content: value.content,
    style,
  }
}

// 解析可选文本内容。
function parseOptionalProjectTextContent(value: unknown): ProjectTextContent | undefined {
  return value === undefined ? undefined : parseProjectTextContent(value) ?? undefined
}

// 解析文本样式。
function parseProjectTextStyle(value: unknown): ProjectTextStyle | null {
  if (!isPlainObject(value)) {
    return null
  }

  if (
    typeof value.color !== 'number'
    || typeof value.fontFamily !== 'string'
    || typeof value.fontSize !== 'number'
    || typeof value.fontWeight !== 'string'
    || typeof value.letterSpacing !== 'number'
    || typeof value.lineHeight !== 'number'
  ) {
    return null
  }

  return {
    color: value.color,
    fontFamily: value.fontFamily,
    fontSize: value.fontSize,
    fontWeight: value.fontWeight as ProjectTextStyle['fontWeight'],
    letterSpacing: value.letterSpacing,
    lineHeight: value.lineHeight,
    maxWidth: typeof value.maxWidth === 'number' ? value.maxWidth : undefined,
    wordWrap: typeof value.wordWrap === 'boolean' ? value.wordWrap : undefined,
  }
}

// 判断图表指标是否合法。
function isProjectChartMetric(value: unknown): value is ProjectChartMetric {
  return isPlainObject(value)
    && typeof value.id === 'string'
    && typeof value.label === 'string'
}

// 判断图表系列是否合法。
function isProjectChartSeries(value: unknown): value is ProjectChartSeries {
  return isPlainObject(value)
    && typeof value.id === 'string'
    && typeof value.label === 'string'
    && typeof value.color === 'number'
}

// 判断分类是否合法。
function isProjectChartCategory(value: unknown): value is ProjectChartCategory {
  return isPlainObject(value)
    && typeof value.id === 'string'
    && typeof value.label === 'string'
    && (value.subLabel === undefined || typeof value.subLabel === 'string')
}

// 判断数据点是否合法。
function isProjectChartPoint(value: unknown): value is ProjectChartPoint {
  if (!isPlainObject(value) || !isPlainObject(value.values)) {
    return false
  }

  return (
    typeof value.categoryId === 'string'
    && (value.seriesId === undefined || typeof value.seriesId === 'string')
    && Object.values(value.values).every(
      (metricValue) => typeof metricValue === 'number' && Number.isFinite(metricValue),
    )
  )
}

// 解析图表样式。
function parseProjectChartStyleConfig(value: unknown): ProjectChartStyleConfig | null {
  if (!isPlainObject(value)) {
    return null
  }

  if (
    typeof value.accentColor !== 'number'
    || typeof value.backgroundPresetId !== 'string'
    || typeof value.baselineColor !== 'number'
    || typeof value.colorPaletteId !== 'string'
    || typeof value.gridAlpha !== 'number'
    || typeof value.gridColor !== 'number'
    || typeof value.labelColor !== 'number'
    || typeof value.panelAlpha !== 'number'
    || typeof value.panelFill !== 'number'
    || typeof value.secondaryValueColor !== 'number'
    || typeof value.trackAlpha !== 'number'
    || typeof value.trackColor !== 'number'
    || typeof value.valueColor !== 'number'
  ) {
    return null
  }

  return {
    accentColor: value.accentColor,
    backgroundPresetId: value.backgroundPresetId,
    baselineColor: value.baselineColor,
    colorPaletteId: value.colorPaletteId,
    gridAlpha: value.gridAlpha,
    gridColor: value.gridColor,
    labelColor: value.labelColor,
    panelAlpha: value.panelAlpha,
    panelFill: value.panelFill,
    secondaryValueColor: value.secondaryValueColor,
    trackAlpha: value.trackAlpha,
    trackColor: value.trackColor,
    valueColor: value.valueColor,
  }
}

// 解析模板配置。
function parseProjectTemplateConfig(value: unknown): ProjectTemplateConfig | null {
  if (!isPlainObject(value) || !isProjectTemplateKind(value.kind)) {
    return null
  }

  if (
    typeof value.primaryMetricId !== 'string'
    || (value.secondaryMetricId !== undefined && typeof value.secondaryMetricId !== 'string')
  ) {
    return null
  }

  if (value.kind === 'grouped-column') {
    if (
      typeof value.showFooter !== 'boolean'
      || typeof value.showLegend !== 'boolean'
      || typeof value.showSubtitle !== 'boolean'
    ) {
      return null
    }

    return {
      kind: 'grouped-column',
      primaryMetricId: value.primaryMetricId,
      secondaryMetricId: value.secondaryMetricId,
      showFooter: value.showFooter,
      showLegend: value.showLegend,
      showSubtitle: value.showSubtitle,
    }
  }

  if (
    (value.scaleMode !== 'absolute' && value.scaleMode !== 'percent-of-max')
    || typeof value.showCategorySubLabel !== 'boolean'
    || typeof value.showSubtitle !== 'boolean'
  ) {
    return null
  }

  return {
    kind: 'ranking-bar',
    primaryMetricId: value.primaryMetricId,
    scaleMode: value.scaleMode,
    secondaryMetricId: value.secondaryMetricId,
    showCategorySubLabel: value.showCategorySubLabel,
    showSubtitle: value.showSubtitle,
  }
}

// 判断模板类型是否合法。
function isProjectTemplateKind(value: unknown): value is ProjectTemplateKind {
  return value === 'grouped-column' || value === 'ranking-bar'
}
