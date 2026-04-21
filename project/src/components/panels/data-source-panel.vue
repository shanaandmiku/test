<script setup lang="ts">
import { computed } from 'vue'

import type { ProjectRecord } from '../../project/project-model'
import { getTemplateDefinition } from '../../templates/template-registry'
import GroupedMatrixEditor from '../editors/grouped-matrix-editor.vue'
import RankingListEditor from '../editors/ranking-list-editor.vue'

const props = defineProps<{
  project: ProjectRecord
  projectId: string
}>()

const templateDefinition = computed(() => getTemplateDefinition(props.project.meta.templateKind))
</script>

<template>
  <div class="panel-stack">
    <section class="panel-group">
      <p class="panel-title">
        数据内容
      </p>
      <GroupedMatrixEditor
        v-if="templateDefinition.dataEditorKind === 'grouped-matrix'"
        :project="project"
        :project-id="projectId"
      />
      <RankingListEditor
        v-else
        :project="project"
        :project-id="projectId"
      />
    </section>
  </div>
</template>

<style scoped>
.panel-stack,
.panel-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panel-title {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 600;
}
</style>
