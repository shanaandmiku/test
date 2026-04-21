<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import groupedColumnProject from './input/grouped-column-project.json'
import rankingBarProject from './input/ranking-bar-project.json'
import {
  createJson2VideoTestRuntime,
  type Json2VideoTestRuntime,
} from './z-core'

// Pixi 挂载节点
const hostRef = ref<HTMLDivElement | null>(null)

let runtime: Json2VideoTestRuntime | null = null

const projectMap = {
  'grouped-column-project': groupedColumnProject,
  'ranking-bar-project': rankingBarProject,
} as const

type ProjectId = keyof typeof projectMap

const selectedProjectId = ref<ProjectId>('grouped-column-project')

const mountRuntime = async (): Promise<void> => {
  if (!hostRef.value) {
    return
  }

  runtime?.destroy()
  runtime = await createJson2VideoTestRuntime(hostRef.value, {
    project: projectMap[selectedProjectId.value],
  })
}

onMounted(async () => {
  await mountRuntime()
})

onBeforeUnmount(() => {
  runtime?.destroy()
  runtime = null
})

watch(selectedProjectId, async () => {
  await mountRuntime()
})
</script>

<template>
  <section class="test-page">
    <header class="test-toolbar">
      <label class="toolbar-label">
        模板测试
        <select v-model="selectedProjectId">
          <option value="grouped-column-project">
            分组竖柱模板
          </option>
          <option value="ranking-bar-project">
            横向排行模板
          </option>
        </select>
      </label>
    </header>
    <div
      ref="hostRef"
      class="test-canvas-host"
    />
  </section>
</template>

<style scoped>
.test-page {
  width: 100%;
  min-height: 100svh;
  background: #02040a;
}

.test-toolbar {
  padding: 12px 16px;
  color: #e5e7eb;
}

.toolbar-label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.test-canvas-host {
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 0;
  border: 1px solid #1f2937;
}

.test-canvas-host :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
