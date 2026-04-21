<script setup lang="ts">
import { computed } from 'vue'

import type { ProjectContentSlotKey, ProjectRecord, ProjectTextContent } from '../../project/project-model'
import { useProjectStore } from '../../project/project-store'
import { useUserConfigStore } from '../../project/user-config'
import { getTemplateDefinition } from '../../templates/template-registry'
import SchemaFieldRenderer from '../fields/schema-field-renderer.vue'
import TextContentField from '../text-content-field.vue'

const props = defineProps<{
  project: ProjectRecord
  projectId: string
}>()

const projectStore = useProjectStore()
const userConfigStore = useUserConfigStore()

const templateDefinition = computed(() => getTemplateDefinition(props.project.meta.templateKind))
const textSlots = computed<Array<{ key: ProjectContentSlotKey, label: string, rows?: number }>>(() =>
  props.project.meta.templateKind === 'ranking-bar'
    ? [
        { key: 'badge', label: '角标样式' },
        { key: 'title', label: '主标题样式', rows: 2 },
        { key: 'subtitle', label: '副标题样式', rows: 2 },
        { key: 'unitLabel', label: '说明文本样式', rows: 2 },
      ]
    : [
        { key: 'eyebrow', label: '页眉样式' },
        { key: 'title', label: '主标题样式', rows: 2 },
        { key: 'subtitle', label: '副标题样式', rows: 3 },
        { key: 'footer', label: '页脚样式', rows: 2 },
        { key: 'unitLabel', label: '说明文本样式', rows: 2 },
      ],
)

// 创建空文本配置。
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

// 更新某个文本槽位。
function updateTextSlot(slotKey: ProjectContentSlotKey, value: ProjectTextContent): void {
  projectStore.updateProjectContent(props.projectId, {
    [slotKey]: value,
  })
}
</script>

<template>
  <div class="panel-stack">
    <section class="panel-group">
      <p class="panel-title">
        模板样式
      </p>
      <div
        v-for="group in templateDefinition.advancedStyleGroups"
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
        文本细节
      </p>
      <TextContentField
        v-for="slot in textSlots"
        :key="slot.key"
        :font-options="userConfigStore.fontCatalog"
        :label="slot.label"
        :model-value="project.content[slot.key] ?? createEmptyTextContent()"
        :rows="slot.rows ?? 2"
        @update:model-value="updateTextSlot(slot.key, $event)"
      />
    </section>
  </div>
</template>

<style scoped>
.panel-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-group,
.group-block {
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
</style>
