import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { clonePlainData, createRandomId, formatDateTime, setValueAtPath, syncLocalStorageRef } from '../util/common'
import type {
  ProjectChartCategory,
  ProjectChartMetric,
  ProjectChartPoint,
  ProjectChartSeries,
  ProjectContentSlots,
  ProjectMeta,
  ProjectPageSettings,
  ProjectRecord,
  ProjectTemplateKind,
} from './project-model'
import { createProjectRecord, duplicateProjectRecord } from './project-factory'
import { createDefaultProjectStoreState, parseProjectStore } from './project-persistence'
import { getProjectListItems, getSelectedProject } from './project-selectors'
import type { ProjectStoreState } from './project-store-types'

// 项目仓库 store，负责项目列表与当前项目的所有读写。
export const useProjectStore = defineStore('project-store', () => {
  const state = ref<ProjectStoreState>(createDefaultProjectStoreState())

  syncLocalStorageRef('project-store', state, {
    parse: parseProjectStore,
  })

  const projectListItems = computed(() => getProjectListItems(state.value))
  const selectedProject = computed(() => getSelectedProject(state.value))

  // 新建项目并设为当前选中项。
  function createProject(templateKind: ProjectTemplateKind, name?: string): string {
    const nextProject = createProjectRecord(templateKind, name)

    state.value.records = {
      ...state.value.records,
      [nextProject.meta.id]: nextProject,
    }
    state.value.order = [...state.value.order, nextProject.meta.id]
    state.value.selectedProjectId = nextProject.meta.id

    return nextProject.meta.id
  }

  // 复制一个现有项目并切换到副本。
  function duplicateProject(projectId: string): string | null {
    const sourceProject = state.value.records[projectId]

    if (!sourceProject) {
      return null
    }

    const nextProject = duplicateProjectRecord(sourceProject)

    state.value.records = {
      ...state.value.records,
      [nextProject.meta.id]: nextProject,
    }
    state.value.order = [...state.value.order, nextProject.meta.id]
    state.value.selectedProjectId = nextProject.meta.id

    return nextProject.meta.id
  }

  // 删除指定项目，并自动切换到相邻项目。
  function deleteProject(projectId: string): void {
    if (!state.value.records[projectId]) {
      return
    }

    const nextOrder = state.value.order.filter((item) => item !== projectId)
    const nextRecords = Object.fromEntries(
      Object.entries(state.value.records).filter(([itemId]) => itemId !== projectId),
    ) as Record<string, ProjectRecord>

    if (nextOrder.length === 0) {
      const fallbackProject = createProjectRecord('grouped-column', '市场周报图表')

      state.value.records = {
        [fallbackProject.meta.id]: fallbackProject,
      }
      state.value.order = [fallbackProject.meta.id]
      state.value.selectedProjectId = fallbackProject.meta.id
      return
    }

    const deletedIndex = state.value.order.findIndex((item) => item === projectId)
    const fallbackProjectId = nextOrder[Math.min(deletedIndex, nextOrder.length - 1)] ?? nextOrder[0]

    state.value.records = nextRecords
    state.value.order = nextOrder
    state.value.selectedProjectId = fallbackProjectId
  }

  // 选中项目。
  function selectProject(projectId: string): void {
    if (state.value.records[projectId]) {
      state.value.selectedProjectId = projectId
    }
  }

  // 更新项目元信息。
  function updateProjectMeta(projectId: string, patch: Partial<ProjectMeta>): void {
    const safePatch = clonePlainData(patch)

    mutateProject(projectId, (project) => {
      project.meta = {
        ...project.meta,
        ...safePatch,
      }
    })
  }

  // 更新页面配置。
  function updateProjectPage(projectId: string, patch: Partial<ProjectPageSettings>): void {
    const safePatch = clonePlainData(patch)

    mutateProject(projectId, (project) => {
      project.page = {
        ...project.page,
        ...safePatch,
      }
    })
  }

  // 更新内容槽位。
  function updateProjectContent(projectId: string, patch: Partial<ProjectContentSlots>): void {
    const safePatch = clonePlainData(patch)

    mutateProject(projectId, (project) => {
      project.content = {
        ...project.content,
        ...safePatch,
      }
    })
  }

  // 更新整个图表配置。
  function updateProjectChart(projectId: string, patch: Partial<ProjectRecord['chart']>): void {
    const safePatch = clonePlainData(patch)

    mutateProject(projectId, (project) => {
      project.chart = {
        ...project.chart,
        ...safePatch,
      }
    })
  }

  // 使用点路径更新项目字段。
  function setProjectValue(projectId: string, path: string, value: unknown): void {
    const safeValue = clonePlainData(value)

    mutateProject(projectId, (project) => {
      setValueAtPath(project as unknown as Record<string, unknown>, path, safeValue)
    })
  }

  // 切换模板，保留项目名、摘要、页面配置和内容槽位。
  function switchTemplate(projectId: string, nextTemplateKind: ProjectTemplateKind): void {
    const currentProject = state.value.records[projectId]

    if (!currentProject || currentProject.meta.templateKind === nextTemplateKind) {
      return
    }

    const rawProject = clonePlainData(currentProject)
    const nextTemplateProject = createProjectRecord(nextTemplateKind, currentProject.meta.name)

    nextTemplateProject.meta.id = rawProject.meta.id
    nextTemplateProject.meta.name = rawProject.meta.name
    nextTemplateProject.meta.summary = rawProject.meta.summary
    nextTemplateProject.meta.updatedAt = formatDateTime()
    nextTemplateProject.page = rawProject.page
    nextTemplateProject.content = {
      ...nextTemplateProject.content,
      ...rawProject.content,
    }

    state.value.records = {
      ...state.value.records,
      [projectId]: nextTemplateProject,
    }
  }

  // 更新指标名称。
  function updateMetric(projectId: string, metricId: string, patch: Partial<ProjectChartMetric>): void {
    const safePatch = clonePlainData(patch)

    mutateProject(projectId, (project) => {
      project.chart.metrics = project.chart.metrics.map((metric) =>
        metric.id === metricId
          ? {
              ...metric,
              ...safePatch,
            }
          : metric,
      )
    })
  }

  // 更新系列名称或颜色。
  function updateSeries(projectId: string, seriesId: string, patch: Partial<ProjectChartSeries>): void {
    const safePatch = clonePlainData(patch)

    mutateProject(projectId, (project) => {
      project.chart.series = project.chart.series.map((series) =>
        series.id === seriesId
          ? {
              ...series,
              ...safePatch,
            }
          : series,
      )
    })
  }

  // 添加一个新系列，并补齐当前所有分类的点数据。
  function addSeries(projectId: string): void {
    mutateProject(projectId, (project) => {
      const nextSeriesId = createRandomId('series')
      const nextSeriesIndex = project.chart.series.length + 1
      const nextMetricValues = createEmptyMetricValues(project.chart.metrics)

      project.chart.series = [
        ...project.chart.series,
        {
          id: nextSeriesId,
          label: `系列 ${nextSeriesIndex}`,
          color: getDefaultSeriesColor(nextSeriesIndex - 1),
        },
      ]

      project.data.points = [
        ...project.data.points,
        ...project.data.categories.map<ProjectChartPoint>((category) => ({
          categoryId: category.id,
          seriesId: nextSeriesId,
          values: { ...nextMetricValues },
        })),
      ]
    })
  }

  // 删除指定系列，并同时清理关联数据点。
  function removeSeries(projectId: string, seriesId: string): void {
    mutateProject(projectId, (project) => {
      project.chart.series = project.chart.series.filter((series) => series.id !== seriesId)
      project.data.points = project.data.points.filter((point) => point.seriesId !== seriesId)
    })
  }

  // 更新分类信息。
  function updateCategory(projectId: string, categoryId: string, patch: Partial<ProjectChartCategory>): void {
    const safePatch = clonePlainData(patch)

    mutateProject(projectId, (project) => {
      project.data.categories = project.data.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              ...safePatch,
            }
          : category,
      )
    })
  }

  // 添加一个新分类，并补齐当前模板需要的数据点。
  function addCategory(projectId: string): void {
    mutateProject(projectId, (project) => {
      const nextCategoryId = createRandomId('category')
      const nextCategoryIndex = project.data.categories.length + 1
      const nextMetricValues = createEmptyMetricValues(project.chart.metrics)
      const nextCategory: ProjectChartCategory = {
        id: nextCategoryId,
        label: `分类 ${nextCategoryIndex}`,
      }

      project.data.categories = [...project.data.categories, nextCategory]

      if (project.meta.templateKind === 'grouped-column') {
        project.data.points = [
          ...project.data.points,
          ...project.chart.series.map<ProjectChartPoint>((series) => ({
            categoryId: nextCategoryId,
            seriesId: series.id,
            values: { ...nextMetricValues },
          })),
        ]
        return
      }

      project.data.points = [
        ...project.data.points,
        {
          categoryId: nextCategoryId,
          values: { ...nextMetricValues },
        },
      ]
    })
  }

  // 删除指定分类，并同时清理关联数据点。
  function removeCategory(projectId: string, categoryId: string): void {
    mutateProject(projectId, (project) => {
      project.data.categories = project.data.categories.filter((category) => category.id !== categoryId)
      project.data.points = project.data.points.filter((point) => point.categoryId !== categoryId)
    })
  }

  // 更新某个单元格中的指标值。
  function setMetricValue(
    projectId: string,
    categoryId: string,
    metricId: string,
    value: number,
    seriesId?: string,
  ): void {
    mutateProject(projectId, (project) => {
      const nextPoints = [...project.data.points]
      const pointIndex = nextPoints.findIndex(
        (point) => point.categoryId === categoryId && point.seriesId === seriesId,
      )

      if (pointIndex >= 0) {
        nextPoints[pointIndex] = {
          ...nextPoints[pointIndex],
          values: {
            ...nextPoints[pointIndex].values,
            [metricId]: value,
          },
        }
      } else {
        nextPoints.push({
          categoryId,
          seriesId,
          values: {
            ...createEmptyMetricValues(project.chart.metrics),
            [metricId]: value,
          },
        })
      }

      project.data.points = nextPoints
    })
  }

  // 应用调色板到当前项目。
  function applyColorPalette(projectId: string, paletteId: string, colors: number[]): void {
    mutateProject(projectId, (project) => {
      project.chart.style.colorPaletteId = paletteId
      project.chart.style.accentColor = colors[0] ?? project.chart.style.accentColor
      project.chart.series = project.chart.series.map((series, index) => ({
        ...series,
        color: colors[index] ?? series.color,
      }))
    })
  }

  // 对指定项目做一次安全变更并刷新更新时间。
  function mutateProject(projectId: string, updater: (project: ProjectRecord) => void): void {
    const currentProject = state.value.records[projectId]

    if (!currentProject) {
      return
    }

    const nextProject = clonePlainData(currentProject)

    updater(nextProject)
    nextProject.meta.updatedAt = formatDateTime()

    state.value.records = {
      ...state.value.records,
      [projectId]: nextProject,
    }
  }

  return {
    addCategory,
    addSeries,
    applyColorPalette,
    createProject,
    deleteProject,
    duplicateProject,
    projectListItems,
    removeCategory,
    removeSeries,
    selectProject,
    selectedProject,
    setMetricValue,
    setProjectValue,
    state,
    switchTemplate,
    updateCategory,
    updateMetric,
    updateProjectChart,
    updateProjectContent,
    updateProjectMeta,
    updateProjectPage,
    updateSeries,
  }
})

// 创建空的指标值集合。
function createEmptyMetricValues(metrics: ProjectChartMetric[]): Record<string, number> {
  return metrics.reduce<Record<string, number>>((result, metric) => {
    result[metric.id] = 0
    return result
  }, {})
}

// 新系列的默认颜色。
function getDefaultSeriesColor(index: number): number {
  const presetColors = [0x2d58ff, 0x35a8ff, 0x10b981, 0xf59e0b, 0xef4444]

  return presetColors[index % presetColors.length]
}
