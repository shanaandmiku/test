<script setup lang="ts">
import type { ProjectChartPoint, ProjectRecord } from '../../project/project-model'
import { useProjectStore } from '../../project/project-store'

const props = defineProps<{
  project: ProjectRecord
  projectId: string
}>()

const projectStore = useProjectStore()

// 读取某个分类下的指标值。
function getMetricValue(categoryId: string, metricId: string): number {
  const point = props.project.data.points.find((item) => item.categoryId === categoryId)

  return readPointMetricValue(point, metricId)
}

// 更新分类名称。
function updateCategoryLabel(categoryId: string, event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  projectStore.updateCategory(props.projectId, categoryId, {
    label: target.value,
  })
}

// 更新分类副标题。
function updateCategorySubLabel(categoryId: string, event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  projectStore.updateCategory(props.projectId, categoryId, {
    subLabel: target.value,
  })
}

// 更新某个单元格数值。
function updateMetricValue(categoryId: string, metricId: string, event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  const nextValue = Number(target.value)

  if (!Number.isFinite(nextValue)) {
    return
  }

  projectStore.setMetricValue(props.projectId, categoryId, metricId, nextValue)
}

// 添加排行项。
function addCategory(): void {
  projectStore.addCategory(props.projectId)
}

// 删除排行项。
function removeCategory(categoryId: string): void {
  projectStore.removeCategory(props.projectId, categoryId)
}

// 安全读取点数据中的某个指标值。
function readPointMetricValue(point: ProjectChartPoint | undefined, metricId: string): number {
  if (!point) {
    return 0
  }

  const value = point.values[metricId]

  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
</script>

<template>
  <div class="editor">
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>主标题</th>
            <th>副标题</th>
            <th
              v-for="metric in project.chart.metrics"
              :key="metric.id"
            >
              {{ metric.label }}
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="category in project.data.categories"
            :key="category.id"
          >
            <td>
              <input
                :value="category.label"
                type="text"
                @input="updateCategoryLabel(category.id, $event)"
              >
            </td>
            <td>
              <input
                :value="category.subLabel ?? ''"
                type="text"
                @input="updateCategorySubLabel(category.id, $event)"
              >
            </td>
            <td
              v-for="metric in project.chart.metrics"
              :key="`${category.id}-${metric.id}`"
            >
              <input
                :value="getMetricValue(category.id, metric.id)"
                type="number"
                step="1"
                @input="updateMetricValue(category.id, metric.id, $event)"
              >
            </td>
            <td>
              <button
                type="button"
                @click="removeCategory(category.id)"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button
      type="button"
      @click="addCategory"
    >
      添加排行项
    </button>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.table-wrap {
  overflow: auto;
  border: 1px solid var(--line);
  background: #ffffff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 6px;
  border: 1px solid var(--line);
  font-size: 12px;
  text-align: left;
  vertical-align: middle;
}

.data-table input {
  width: 100%;
}
</style>
