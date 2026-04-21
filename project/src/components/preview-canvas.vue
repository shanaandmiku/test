<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { getProjectResolution } from '../project/project-selectors'
import { useProjectStore } from '../project/project-store'
import { useUserConfigStore } from '../project/user-config'
import {
  createPreviewRenderer,
  type PreviewRenderer,
} from '../rander/core'

// 预览区域外层容器
const previewFrameRef = ref<HTMLDivElement | null>(null)
// Pixi 画布挂载节点
const stageHostRef = ref<HTMLDivElement | null>(null)
// 预览壳层的实际显示宽度
const stageShellWidth = ref(0)
// 预览壳层的实际显示高度
const stageShellHeight = ref(0)

const projectStore = useProjectStore()
const userConfigStore = useUserConfigStore()

// 当前项目数据
const currentProject = computed(() => projectStore.selectedProject)
// 当前分辨率
const currentResolution = computed(() =>
  getProjectResolution(currentProject.value, userConfigStore.resolutionCatalog),
)
// 当前背景预设
const currentBackgroundPreset = computed(() =>
  userConfigStore.getBackgroundPresetById(
    currentProject.value?.chart.style.backgroundPresetId ?? 'background-dark-stage',
  ),
)

// 当前预览渲染器实例
let renderer: PreviewRenderer | null = null
let frameResizeObserver: ResizeObserver | null = null

// 预览壳层尺寸样式
const stageShellStyle = computed<Record<string, string>>(() => ({
  width: `${stageShellWidth.value}px`,
  height: `${stageShellHeight.value}px`,
}))

// 固定逻辑尺寸画布的缩放和平移样式
const stageHostStyle = computed<Record<string, string>>(() => {
  const pageWidth = currentResolution.value.width
  const pageHeight = currentResolution.value.height
  const widthScale = stageShellWidth.value / pageWidth
  const heightScale = stageShellHeight.value / pageHeight
  const translateWidth = -(((pageWidth - stageShellWidth.value) / 2) / widthScale)
  const translateHeight = -(((pageHeight - stageShellHeight.value) / 2) / heightScale)

  return {
    width: `${pageWidth}px`,
    height: `${pageHeight}px`,
    transform: `scale(${widthScale}, ${heightScale}) translate(${translateWidth}px, ${translateHeight}px)`,
  }
})

// 根据外层可用空间更新预览显示尺寸
const updateStageScale = () => {
  if (!previewFrameRef.value || !renderer) {
    return
  }

  const frameBounds = previewFrameRef.value.getBoundingClientRect()
  const viewport = renderer.getViewportSize(frameBounds.width, frameBounds.height)

  stageShellWidth.value = viewport.width
  stageShellHeight.value = viewport.height
}

// 项目配置变化时刷新渲染器和预览尺寸
watch(
  () => [
    currentProject.value ? JSON.stringify(currentProject.value) : '',
    JSON.stringify(currentResolution.value),
    JSON.stringify(currentBackgroundPreset.value),
  ],
  () => {
    if (!currentProject.value) {
      return
    }

    renderer?.updateProject(
      currentProject.value,
      currentResolution.value,
      currentBackgroundPreset.value,
    )
    updateStageScale()
  },
)

// 挂载时创建渲染器并监听容器尺寸
onMounted(async () => {
  if (!stageHostRef.value || !currentProject.value) {
    return
  }

  renderer = await createPreviewRenderer(
    {
      backgroundPreset: currentBackgroundPreset.value,
      project: currentProject.value,
      resolution: currentResolution.value,
    },
    stageHostRef.value,
  )

  updateStageScale()

  if (previewFrameRef.value) {
    frameResizeObserver = new ResizeObserver(() => {
      updateStageScale()
    })

    frameResizeObserver.observe(previewFrameRef.value)
  }
})

// 卸载时销毁渲染器和尺寸监听
onBeforeUnmount(() => {
  frameResizeObserver?.disconnect()
  renderer?.destroy()
  frameResizeObserver = null
  renderer = null
})
</script>

<template>
  <div
    ref="previewFrameRef"
    class="preview-canvas"
  >
    <div
      class="preview-stage-shell"
      :style="stageShellStyle"
    >
      <div
        ref="stageHostRef"
        :style="stageHostStyle"
        class="preview-stage"
      />
    </div>
  </div>
</template>

<style scoped>
.preview-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #e1e4e8;
}

.preview-stage-shell {
  flex: none;
  border: 1px solid var(--line);
  background: #ffffff;
}
</style>
