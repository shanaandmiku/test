<script setup lang="ts">
import { computed } from 'vue'

import { useProjectStore } from '../project/project-store'
import AdvancedStylePanel from './panels/advanced-style-panel.vue'
import BasicInfoPanel from './panels/basic-info-panel.vue'
import DataSourcePanel from './panels/data-source-panel.vue'

const projectStore = useProjectStore()

const currentProject = computed(() => projectStore.selectedProject)
const currentProjectId = computed(() => projectStore.state.selectedProjectId)
</script>

<template>
  <aside class="side-panel">
    <template v-if="currentProject">
      <BasicInfoPanel
        :project="currentProject"
        :project-id="currentProjectId"
      />
      <DataSourcePanel
        :project="currentProject"
        :project-id="currentProjectId"
      />
      <AdvancedStylePanel
        :project="currentProject"
        :project-id="currentProjectId"
      />
    </template>
  </aside>
</template>

<style scoped>
.side-panel {
  min-width: 0;
  min-height: 0;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f3f4f6;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
