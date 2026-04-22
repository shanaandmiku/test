<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import groupedColumnProject from '../core/input/grouped-column-project.json'
import {
  createJson2VideoRuntime,
  type Json2VideoTestRuntime,
} from '../core/z-core.ts'

// Pixi 挂载节点
const hostRef = ref<HTMLDivElement | null>(null)

let runtime: Json2VideoTestRuntime | null = null

const mountRuntime = async (): Promise<void> => {
  if (!hostRef.value) {
    return
  }

  runtime?.destroy()
  runtime = await createJson2VideoRuntime(hostRef.value, {
    project: groupedColumnProject,
  })
}

onMounted(async () => {
  await mountRuntime()
})

onBeforeUnmount(() => {
  runtime?.destroy()
  runtime = null
})
</script>

<template>
  <section class="test-page">
    <div class="test-canvas-host" />
    <div class="test-canvas-host" />
    <div class="test-canvas-host" />
    <div ref="hostRef" class="test-canvas-host" />
  </section>
</template>

<style scoped>
.test-page {
  width: 100%;
  height: 100vh;
  background: #02040a;
  display: flex;
  flex-wrap: wrap;
}

.test-canvas-host {
  width: 50%;
  height: 50%;
  border: 1px solid red;
}

.test-canvas-host :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
