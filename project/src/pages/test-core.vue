<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import groupedColumnProject from "../core/input/grouped-column-project.json";
import {
  createJson2VideoTestRuntime,
  type Json2VideoTestRuntime,
} from "../core/z-core.ts";

// Pixi 挂载节点
const hostRef = ref<HTMLDivElement | null>(null);

let runtime: Json2VideoTestRuntime | null = null;

const mountRuntime = async (): Promise<void> => {
  if (!hostRef.value) {
    return;
  }

  runtime?.destroy();
  runtime = await createJson2VideoTestRuntime(hostRef.value, {
    project: groupedColumnProject,
  });
};

onMounted(async () => {
  await mountRuntime();
});

onBeforeUnmount(() => {
  runtime?.destroy();
  runtime = null;
});
</script>

<template>
  <section class="test-page">
    <div ref="hostRef" class="test-canvas-host" />
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
