<script setup lang="ts">
import { computed } from 'vue'

import { useProjectStore } from '../../project/project-store'
import { useUserConfigStore } from '../../project/user-config'
import type { ProjectRecord } from '../../project/project-model'
import type { TemplateFieldSchema } from '../../templates/template-types'
import { getValueAtPath } from '../../util/common'

const props = defineProps<{
  field: TemplateFieldSchema
  project: ProjectRecord
  projectId: string
}>()

const projectStore = useProjectStore()
const userConfigStore = useUserConfigStore()

const fieldValue = computed(() => getValueAtPath(props.project, props.field.path))

const selectOptions = computed(() => {
  if (props.field.type !== 'select') {
    return []
  }

  if (props.field.options && props.field.options.length > 0) {
    return props.field.options
  }

  switch (props.field.optionsSource) {
    case 'backgroundPresetCatalog':
      return userConfigStore.backgroundPresetCatalog.map((item) => ({
        label: item.label,
        value: item.id,
      }))
    case 'colorPaletteCatalog':
      return userConfigStore.colorPaletteCatalog.map((item) => ({
        label: item.label,
        value: item.id,
      }))
    case 'resolutionCatalog':
      return userConfigStore.resolutionCatalog.map((item) => ({
        label: `${item.label} / ${item.width} × ${item.height}`,
        value: item.id,
      }))
    default:
      return []
  }
})

const colorValue = computed(() => colorNumberToHex(typeof fieldValue.value === 'number' ? fieldValue.value : 0))

// 处理通用字段输入。
function updateFieldValue(event: Event): void {
  const target = event.target

  if (props.field.type === 'toggle') {
    if (!(target instanceof HTMLInputElement)) {
      return
    }

    projectStore.setProjectValue(props.projectId, props.field.path, target.checked)
    return
  }

  if (props.field.type === 'number') {
    if (!(target instanceof HTMLInputElement)) {
      return
    }

    const nextValue = Number(target.value)

    if (!Number.isFinite(nextValue)) {
      return
    }

    projectStore.setProjectValue(props.projectId, props.field.path, nextValue)
    return
  }

  if (props.field.type === 'color') {
    if (!(target instanceof HTMLInputElement)) {
      return
    }

    projectStore.setProjectValue(props.projectId, props.field.path, colorHexToNumber(target.value))
    return
  }

  if (props.field.type === 'select') {
    if (!(target instanceof HTMLSelectElement)) {
      return
    }

    projectStore.setProjectValue(props.projectId, props.field.path, target.value)
    return
  }

  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return
  }

  projectStore.setProjectValue(props.projectId, props.field.path, target.value)
}

// 将数值颜色转换成原生 color input 可读的十六进制字符串。
function colorNumberToHex(value: number): string {
  const safeColor = Math.max(0, Math.min(0xffffff, Math.trunc(value)))
  return `#${safeColor.toString(16).padStart(6, '0')}`
}

// 将十六进制颜色字符串转换成 Pixi 使用的数字颜色值。
function colorHexToNumber(value: string): number {
  return Number.parseInt(value.replace('#', ''), 16)
}
</script>

<template>
  <label class="field">
    <span class="field-label">{{ field.label }}</span>
    <input
      v-if="field.type === 'text'"
      :value="typeof fieldValue === 'string' ? fieldValue : ''"
      type="text"
      @input="updateFieldValue"
    >
    <textarea
      v-else-if="field.type === 'textarea'"
      :value="typeof fieldValue === 'string' ? fieldValue : ''"
      :rows="field.rows ?? 2"
      @input="updateFieldValue"
    />
    <input
      v-else-if="field.type === 'number'"
      :value="typeof fieldValue === 'number' ? fieldValue : 0"
      type="number"
      :min="field.min"
      :max="field.max"
      :step="field.step ?? 1"
      @input="updateFieldValue"
    >
    <input
      v-else-if="field.type === 'toggle'"
      :checked="fieldValue === true"
      type="checkbox"
      @change="updateFieldValue"
    >
    <select
      v-else-if="field.type === 'select'"
      :value="typeof fieldValue === 'string' ? fieldValue : ''"
      @change="updateFieldValue"
    >
      <option
        v-for="option in selectOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <input
      v-else-if="field.type === 'color'"
      :value="colorValue"
      type="color"
      @input="updateFieldValue"
    >
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 12px;
  color: var(--ink-muted);
}
</style>
