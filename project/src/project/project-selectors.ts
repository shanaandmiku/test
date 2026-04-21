import type { ProjectChartMetric, ProjectChartPoint, ProjectRecord } from './project-model'
import type { ProjectStoreState, ProjectListItemView } from './project-store-types'
import type { ProjectResolutionOption } from './project-types'

// 当前选中的项目。
export function getSelectedProject(state: ProjectStoreState): ProjectRecord | null {
  return state.records[state.selectedProjectId] ?? null
}

// 生成左侧项目列表。
export function getProjectListItems(state: ProjectStoreState): ProjectListItemView[] {
  return state.order
    .map((projectId) => state.records[projectId])
    .filter((project): project is ProjectRecord => project !== undefined)
    .map((project) => ({
      id: project.meta.id,
      name: project.meta.name,
      summary: project.meta.summary,
      templateKind: project.meta.templateKind,
      updatedAt: project.meta.updatedAt,
    }))
}

// 获取项目当前选中的分辨率。
export function getProjectResolution(
  project: ProjectRecord | null,
  resolutionCatalog: ProjectResolutionOption[],
): ProjectResolutionOption {
  const fallbackResolution = resolutionCatalog[0]

  return resolutionCatalog.find((resolution) => resolution.id === project?.page.resolutionId)
    ?? fallbackResolution
}

// 根据分类和系列找到数据点。
export function findChartPoint(
  project: ProjectRecord,
  categoryId: string,
  seriesId?: string,
): ProjectChartPoint | undefined {
  return project.data.points.find(
    (point) => point.categoryId === categoryId && point.seriesId === seriesId,
  )
}

// 获取模板当前使用的主指标。
export function getPrimaryMetric(project: ProjectRecord): ProjectChartMetric | undefined {
  return project.chart.metrics.find(
    (metric) => metric.id === project.chart.template.primaryMetricId,
  )
}
