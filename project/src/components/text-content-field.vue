<script setup lang="ts">
import { computed, ref } from 'vue'

import type { FontCatalogItem } from '../project/resource-catalogs'
import type { ProjectTextContent, ProjectTextStyle } from '../project/project-model'

withDefaults(
  defineProps<{
    fontOptions?: FontCatalogItem[]
    label: string
    rows?: number
  }>(),
  {
    fontOptions: () => [],
    rows: 2,
  },
)

const model = defineModel<ProjectTextContent>({
  required: true,
})
const isStyleEditorVisible = ref(false)
const fontListId = `font-options-${Math.random().toString(36).slice(2, 10)}`

const contentModel = computed({
  get: () => model.value.content,
  set: (value: string) => {
    model.value = {
      ...model.value,
      content: value,
    }
  },
})

const colorModel = computed({
  get: () => colorNumberToHex(model.value.style.color),
  set: (value: string) => {
    updateStyleValue('color', colorHexToNumber(value))
  },
})

const fontFamilyModel = computed({
  get: () => model.value.style.fontFamily,
  set: (value: string) => {
    updateStyleValue('fontFamily', value)
  },
})

const fontWeightModel = computed({
  get: () => String(model.value.style.fontWeight),
  set: (value: string) => {
    updateStyleValue('fontWeight', value as ProjectTextStyle['fontWeight'])
  },
})

const wordWrapModel = computed({
  get: () => model.value.style.wordWrap ?? true,
  set: (value: boolean) => {
    updateStyleValue('wordWrap', value)
  },
})

// 切换样式编辑区显示状态。
const toggleStyleEditor = () => {
  isStyleEditorVisible.value = !isStyleEditorVisible.value
}

// 更新文本样式中的单个字段。
function updateStyleValue<K extends keyof ProjectTextStyle>(
  key: K,
  value: ProjectTextStyle[K],
): void {
  model.value = {
    ...model.value,
    style: {
      ...model.value.style,
      [key]: value,
    },
  }
}

// 处理必填数字样式字段输入。
function updateRequiredNumberStyle<K extends 'fontSize' | 'letterSpacing' | 'lineHeight'>(
  key: K,
  event: Event,
): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  const nextValue = Number(target.value)

  if (!Number.isFinite(nextValue)) {
    return
  }

  if ((key === 'fontSize' || key === 'lineHeight') && nextValue <= 0) {
    return
  }

  updateStyleValue(key, nextValue)
}

// 处理可选数字样式字段输入，清空时移除该字段。
function updateOptionalNumberStyle(
  key: 'maxWidth',
  event: Event,
): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) {
    return
  }

  if (target.value === '') {
    model.value = {
      ...model.value,
      style: {
        ...model.value.style,
        maxWidth: undefined,
      },
    }
    return
  }

  const nextValue = Number(target.value)

  if (!Number.isFinite(nextValue) || nextValue <= 0) {
    return
  }

  updateStyleValue(key, nextValue)
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
    <span class="field-header">
      <span class="field-label">{{ label }}</span>
      <button
        type="button"
        @click="toggleStyleEditor"
      >
        {{ isStyleEditorVisible ? '收起' : '编辑' }}
      </button>
    </span>
    <textarea
      v-model="contentModel"
      class="field-textarea"
      :rows="rows"
    />
    <div
      v-if="isStyleEditorVisible"
      class="style-editor"
    >
      <label class="style-field">
        <span class="field-label">颜色</span>
        <input
          v-model.lazy="colorModel"
          type="color"
        >
      </label>
      <label class="style-field style-field-wide">
        <span class="field-label">字体</span>
        <input
          v-model="fontFamilyModel"
          :list="fontOptions.length > 0 ? fontListId : undefined"
          type="text"
        >
        <datalist
          v-if="fontOptions.length > 0"
          :id="fontListId"
        >
          <option
            v-for="option in fontOptions"
            :key="option.id"
            :value="option.fontFamily"
          >
            {{ option.label }}
          </option>
        </datalist>
      </label>
      <label class="style-field">
        <span class="field-label">字号</span>
        <input
          :value="model.style.fontSize"
          type="number"
          min="1"
          step="1"
          @input="updateRequiredNumberStyle('fontSize', $event)"
        >
      </label>
      <label class="style-field">
        <span class="field-label">字重</span>
        <input
          v-model="fontWeightModel"
          type="text"
        >
      </label>
      <label class="style-field">
        <span class="field-label">字距</span>
        <input
          :value="model.style.letterSpacing"
          type="number"
          step="0.1"
          @input="updateRequiredNumberStyle('letterSpacing', $event)"
        >
      </label>
      <label class="style-field">
        <span class="field-label">行高</span>
        <input
          :value="model.style.lineHeight"
          type="number"
          min="1"
          step="1"
          @input="updateRequiredNumberStyle('lineHeight', $event)"
        >
      </label>
      <label class="style-field style-field-wide">
        <span class="field-label">最大宽度</span>
        <input
          :value="model.style.maxWidth ?? ''"
          type="number"
          min="1"
          step="1"
          placeholder="留空表示不限制"
          @input="updateOptionalNumberStyle('maxWidth', $event)"
        >
      </label>
      <label class="style-field style-field-wide style-field-inline">
        <span class="field-label">自动换行</span>
        <input
          v-model="wordWrapModel"
          type="checkbox"
        >
      </label>
    </div>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.field-label {
  font-size: 12px;
  color: var(--ink-muted);
}

.field-textarea {
  width: 100%;
  min-height: 44px;
  resize: vertical;
}

.style-editor {
  margin-top: 4px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  border: 1px solid var(--line);
  background: #ffffff;
}

.style-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.style-field-wide {
  grid-column: 1 / -1;
}

.style-field input {
  width: 100%;
}

.style-field-inline {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.style-field-inline input {
  width: auto;
}
</style>
