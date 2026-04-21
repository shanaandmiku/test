import type { TextStyleFontWeight } from 'pixi.js'

/** 支持的图表模板类型。 */
export type ProjectTemplateKind = 'grouped-column' | 'ranking-bar'

/** 文本样式配置。 */
export interface ProjectTextStyle {
  color: number
  fontFamily: string
  fontSize: number
  fontWeight: TextStyleFontWeight
  letterSpacing: number
  lineHeight: number
  maxWidth?: number
  wordWrap?: boolean
}

/** 文本内容配置。 */
export interface ProjectTextContent {
  content: string
  style: ProjectTextStyle
}

/** 项目元信息。 */
export interface ProjectMeta {
  id: string
  name: string
  summary: string
  templateKind: ProjectTemplateKind
  updatedAt: string
}

/** 页面级配置。 */
export interface ProjectPageSettings {
  frameRate: number
  resolutionId: string
}

/** 页面文本槽位。 */
export interface ProjectContentSlots {
  badge?: ProjectTextContent
  eyebrow?: ProjectTextContent
  footer?: ProjectTextContent
  subtitle?: ProjectTextContent
  title: ProjectTextContent
  unitLabel?: ProjectTextContent
}

/** 图表指标定义。 */
export interface ProjectChartMetric {
  id: string
  label: string
}

/** 图表系列定义。 */
export interface ProjectChartSeries {
  color: number
  id: string
  label: string
}

/** 图表分类定义。 */
export interface ProjectChartCategory {
  id: string
  label: string
  subLabel?: string
}

/** 图表数据点。 */
export interface ProjectChartPoint {
  categoryId: string
  seriesId?: string
  values: Record<string, number>
}

/** 原始数据源。 */
export interface ProjectDataSource {
  categories: ProjectChartCategory[]
  points: ProjectChartPoint[]
}

/** 图表渲染层样式配置。 */
export interface ProjectChartStyleConfig {
  accentColor: number
  backgroundPresetId: string
  baselineColor: number
  colorPaletteId: string
  gridAlpha: number
  gridColor: number
  labelColor: number
  panelAlpha: number
  panelFill: number
  secondaryValueColor: number
  trackAlpha: number
  trackColor: number
  valueColor: number
}

/** 分组竖柱模板配置。 */
export interface GroupedColumnTemplateConfig {
  kind: 'grouped-column'
  primaryMetricId: string
  secondaryMetricId?: string
  showFooter: boolean
  showLegend: boolean
  showSubtitle: boolean
}

/** 横向排行模板配置。 */
export interface RankingBarTemplateConfig {
  kind: 'ranking-bar'
  primaryMetricId: string
  scaleMode: 'absolute' | 'percent-of-max'
  secondaryMetricId?: string
  showCategorySubLabel: boolean
  showSubtitle: boolean
}

/** 模板专属配置。 */
export type ProjectTemplateConfig = GroupedColumnTemplateConfig | RankingBarTemplateConfig

/** 图表配置。 */
export interface ProjectChartConfig {
  metrics: ProjectChartMetric[]
  series: ProjectChartSeries[]
  style: ProjectChartStyleConfig
  template: ProjectTemplateConfig
}

/** 单个项目的完整记录。 */
export interface ProjectRecord {
  chart: ProjectChartConfig
  content: ProjectContentSlots
  data: ProjectDataSource
  meta: ProjectMeta
  page: ProjectPageSettings
}

/** 文本槽位键。 */
export type ProjectContentSlotKey = keyof ProjectContentSlots
