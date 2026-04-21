<script setup lang="ts">
import { computed, ref } from 'vue'

import type { ProjectContentSlotKey, ProjectRecord, ProjectTextContent } from '../../project/project-model'
import type { ProjectResolutionOption } from '../../project/project-types'
import { useProjectStore } from '../../project/project-store'
import { useUserConfigStore } from '../../project/user-config'
import { getTemplateOptions, getTemplateDefinition } from '../../templates/template-registry'
import SchemaFieldRenderer from '../fields/schema-field-renderer.vue'
import TextContentField from '../text-content-field.vue'

const props = defineProps<{
  project: ProjectRecord
  projectId: string
}>()

const projectStore = useProjectStore()
const userConfigStore = useUserConfigStore()

const templateDefinition = computed(() => getTemplateDefinition(props.project.meta.templateKind))
const templateOptions = computed(() => getTemplateOptions())
const isCustomResolutionFormVisible = ref(false)
const customResolutionLabel = ref('')
const customResolutionWidth = ref('')
const customResolutionHeight = ref('')

const displayedTextSlots = computed<Array<{ key: ProjectContentSlotKey, label: string, rows?: number }>>(() => {
  if (props.project.meta.templateKind === 'ranking-bar') {
    return [
      { key: 'badge', label: '角标' },
      { key: 'title', label: '主标题', rows: 2 },
      { key: 'subtitle', label: '副标题', rows: 2 },
      { key: 'unitLabel', label: '说明文本', rows: 2 },
    ]
  }

  return [
    { key: 'eyebrow', label: '页眉' },
    { key: 'title', label: '主标题', rows: 2 },
    { key: 'subtitle', label: '副标题', rows: 3 },
    { key: 'footer', label: '页脚', rows: 2 },
    { key: 'unitLabel', label: '说明文本', rows: 2 },
  ]
})

const canDeleteSelectedResolution = computed(() =>
  props.project.page.resolutionId.startsWith('custom-'),
)

const canSubmitCustomResolution = computed(() => {
  const width = Number(customResolutionWidth.value)
  const height = Number(customResolutionHeight.value)

  return Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0
})

// 创建空文本配置，用于补齐可选槽位。
function createEmptyTextContent(): ProjectTextContent {
  return {
    content: '',
    style: {
      color: 0xf8fafc,
      fontFamily: userConfigStore.fontCatalog[0]?.fontFamily ?? 'Space Grotesk',
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: 0,
      lineHeight: 28,
      wordWrap: false,
    },
  }
}

// 更新文本槽位。
function updateTextSlot(slotKey: ProjectContentSlotKey, value: ProjectTextContent): void {
  projectStore.updateProjectContent(props.projectId, {
    [slotKey]: value,
  })
}

// 更新项目名。
function updateProjectName(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  projectStore.updateProjectMeta(props.projectId, {
    name: target.value,
  })
}

// 更新项目摘要。
function updateProjectSummary(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLTextAreaElement)) {
    return
  }

  projectStore.updateProjectMeta(props.projectId, {
    summary: target.value,
  })
}

// 切换模板类型。
function updateTemplateKind(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLSelectElement)) {
    return
  }

  projectStore.switchTemplate(props.projectId, target.value as ProjectRecord['meta']['templateKind'])
}

// 切换分辨率。
function updateResolution(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLSelectElement)) {
    return
  }

  projectStore.updateProjectPage(props.projectId, {
    resolutionId: target.value,
  })
}

// 调整帧率。
function updateFrameRate(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  const nextValue = Number(target.value)

  if (!Number.isFinite(nextValue)) {
    return
  }

  projectStore.updateProjectPage(props.projectId, {
    frameRate: Math.min(Math.max(Math.round(nextValue), 1), 120),
  })
}

// 应用调色板。
function updateColorPalette(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLSelectElement)) {
    return
  }

  const palette = userConfigStore.getColorPaletteById(target.value)
  projectStore.applyColorPalette(props.projectId, palette.id, palette.colors)
}

// 更新指标名称。
function updateMetricLabel(metricId: string, event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  projectStore.updateMetric(props.projectId, metricId, {
    label: target.value,
  })
}

// 更新系列名称。
function updateSeriesLabel(seriesId: string, event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  projectStore.updateSeries(props.projectId, seriesId, {
    label: target.value,
  })
}

// 更新系列颜色。
function updateSeriesColor(seriesId: string, event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  projectStore.updateSeries(props.projectId, seriesId, {
    color: Number.parseInt(target.value.replace('#', ''), 16),
  })
}

// 显示新增分辨率表单。
function openCustomResolutionForm(): void {
  isCustomResolutionFormVisible.value = true
}

// 重置新增分辨率表单。
function closeCustomResolutionForm(): void {
  isCustomResolutionFormVisible.value = false
  customResolutionLabel.value = ''
  customResolutionWidth.value = ''
  customResolutionHeight.value = ''
}

// 创建自定义分辨率并切换到新分辨率。
function addCustomResolution(): void {
  const width = Number(customResolutionWidth.value)
  const height = Number(customResolutionHeight.value)

  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    return
  }

  const existedResolution = userConfigStore.resolutionCatalog.find(
    (option) => option.width === width && option.height === height,
  )

  if (existedResolution) {
    projectStore.updateProjectPage(props.projectId, {
      resolutionId: existedResolution.id,
    })
    closeCustomResolutionForm()
    return
  }

  const nextResolution: ProjectResolutionOption = {
    id: createCustomResolutionId(userConfigStore.resolutionCatalog),
    label: customResolutionLabel.value.trim() || `${width} × ${height}`,
    width,
    height,
  }

  userConfigStore.addCustomResolution(nextResolution)
  projectStore.updateProjectPage(props.projectId, {
    resolutionId: nextResolution.id,
  })
  closeCustomResolutionForm()
}

// 删除当前选中的自定义分辨率。
function removeSelectedCustomResolution(): void {
  if (!canDeleteSelectedResolution.value) {
    return
  }

  userConfigStore.removeResolution(props.project.page.resolutionId)

  projectStore.updateProjectPage(props.projectId, {
    resolutionId: userConfigStore.resolutionCatalog[0]?.id ?? 'resolution-1080p',
  })
}

// 添加系列。
function addSeries(): void {
  projectStore.addSeries(props.projectId)
}

// 删除系列。
function removeSeries(seriesId: string): void {
  projectStore.removeSeries(props.projectId, seriesId)
}

// 生成 custom- 前缀的随机 id。
function createCustomResolutionId(options: ProjectResolutionOption[]): string {
  let nextId = ''

  do {
    nextId = `custom-${Math.random().toString().slice(2, 10)}`
  } while (options.some((option) => option.id === nextId))

  return nextId
}

// 转成 color input 使用的十六进制字符串。
function toColorHex(value: number): string {
  return `#${Math.max(0, Math.min(0xffffff, Math.trunc(value))).toString(16).padStart(6, '0')}`
}
</script>

<template>
  <div class="panel-stack">
    <section class="panel-group">
      <p class="panel-title">
        基础设置
      </p>
      <label class="field">
        <span class="field-label">项目名称</span>
        <input
          :value="project.meta.name"
          type="text"
          @input="updateProjectName"
        >
      </label>
      <label class="field">
        <span class="field-label">项目摘要</span>
        <textarea
          :value="project.meta.summary"
          rows="2"
          @input="updateProjectSummary"
        />
      </label>
      <label class="field">
        <span class="field-label">模板类型</span>
        <select
          :value="project.meta.templateKind"
          @change="updateTemplateKind"
        >
          <option
            v-for="option in templateOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
      <label class="field">
        <span class="field-label">当前分辨率</span>
        <div class="row">
          <select
            class="grow"
            :value="project.page.resolutionId"
            @change="updateResolution"
          >
            <option
              v-for="resolution in userConfigStore.resolutionCatalog"
              :key="resolution.id"
              :value="resolution.id"
            >
              {{ resolution.label }} / {{ resolution.width }} × {{ resolution.height }}
            </option>
          </select>
          <button
            type="button"
            @click="openCustomResolutionForm"
          >
            新增
          </button>
          <button
            v-if="canDeleteSelectedResolution"
            type="button"
            @click="removeSelectedCustomResolution"
          >
            删除
          </button>
        </div>
        <div
          v-if="isCustomResolutionFormVisible"
          class="sub-form"
        >
          <label class="field">
            <span class="field-label">名称</span>
            <input
              v-model="customResolutionLabel"
              type="text"
              placeholder="默认使用宽 × 高"
            >
          </label>
          <div class="grid-two">
            <label class="field">
              <span class="field-label">宽度</span>
              <input
                v-model="customResolutionWidth"
                type="number"
                min="1"
                step="1"
              >
            </label>
            <label class="field">
              <span class="field-label">高度</span>
              <input
                v-model="customResolutionHeight"
                type="number"
                min="1"
                step="1"
              >
            </label>
          </div>
          <div class="row">
            <button
              type="button"
              :disabled="!canSubmitCustomResolution"
              @click="addCustomResolution"
            >
              保存
            </button>
            <button
              type="button"
              @click="closeCustomResolutionForm"
            >
              取消
            </button>
          </div>
        </div>
      </label>
      <label class="field">
        <span class="field-label">帧率</span>
        <input
          :value="project.page.frameRate"
          type="number"
          min="1"
          max="120"
          step="1"
          @input="updateFrameRate"
        >
      </label>
      <label class="field">
        <span class="field-label">调色板</span>
        <select
          :value="project.chart.style.colorPaletteId"
          @change="updateColorPalette"
        >
          <option
            v-for="palette in userConfigStore.colorPaletteCatalog"
            :key="palette.id"
            :value="palette.id"
          >
            {{ palette.label }}
          </option>
        </select>
      </label>
      <div
        v-for="group in templateDefinition.basicInfoGroups"
        :key="group.id"
        class="group-block"
      >
        <p class="sub-title">
          {{ group.title }}
        </p>
        <SchemaFieldRenderer
          v-for="field in group.fields"
          :key="field.id"
          :field="field"
          :project="project"
          :project-id="projectId"
        />
      </div>
    </section>

    <section class="panel-group">
      <p class="panel-title">
        文本内容
      </p>
      <TextContentField
        v-for="slot in displayedTextSlots"
        :key="slot.key"
        :font-options="userConfigStore.fontCatalog"
        :label="slot.label"
        :model-value="project.content[slot.key] ?? createEmptyTextContent()"
        :rows="slot.rows ?? 2"
        @update:model-value="updateTextSlot(slot.key, $event)"
      />
    </section>

    <section class="panel-group">
      <p class="panel-title">
        指标与系列
      </p>
      <label
        v-for="metric in project.chart.metrics"
        :key="metric.id"
        class="field"
      >
        <span class="field-label">指标名称</span>
        <input
          :value="metric.label"
          type="text"
          @input="updateMetricLabel(metric.id, $event)"
        >
      </label>
      <div
        v-if="project.chart.series.length > 0"
        class="series-stack"
      >
        <div
          v-for="series in project.chart.series"
          :key="series.id"
          class="series-item"
        >
          <label class="field grow">
            <span class="field-label">系列名称</span>
            <input
              :value="series.label"
              type="text"
              @input="updateSeriesLabel(series.id, $event)"
            >
          </label>
          <label class="field">
            <span class="field-label">颜色</span>
            <input
              :value="toColorHex(series.color)"
              type="color"
              @input="updateSeriesColor(series.id, $event)"
            >
          </label>
          <button
            v-if="project.chart.series.length > 1"
            type="button"
            @click="removeSeries(series.id)"
          >
            删除
          </button>
        </div>
      </div>
      <button
        v-if="project.meta.templateKind === 'grouped-column'"
        type="button"
        @click="addSeries"
      >
        添加系列
      </button>
    </section>
  </div>
</template>

<style scoped>
.panel-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panel-title,
.sub-title {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 600;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 12px;
  color: var(--ink-muted);
}

.row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.grow {
  flex: 1;
  min-width: 0;
}

.sub-form {
  margin-top: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--line);
  background: #ffffff;
}

.grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.group-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.series-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.series-item {
  display: flex;
  gap: 6px;
  align-items: end;
}
</style>
