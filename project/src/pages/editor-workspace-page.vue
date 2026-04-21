<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import PreviewCanvas from '../components/preview-canvas.vue'
import ProjectConfigPanel from '../components/project-config-panel.vue'
import ProjectListPanel from '../components/project-list-panel.vue'

type ResizeSide = 'left' | 'right'

// 三栏工作区根节点
const shellRef = ref<HTMLElement | null>(null)
// 左侧面板宽度
const leftPanelWidth = ref(220)
// 右侧面板宽度
const rightPanelWidth = ref(260)

// 分隔线和面板的基础尺寸约束
const splitterWidth = 6
const leftPanelMin = 160
const rightPanelMin = 180
const previewMin = 480

// 当前正在拖拽的分隔线方向
let activeResizeSide: ResizeSide | null = null
let shellResizeObserver: ResizeObserver | null = null

// 把面板宽度同步到网格布局变量
const shellStyle = computed<Record<string, string>>(() => ({
  '--left-panel-width': `${leftPanelWidth.value}px`,
  '--right-panel-width': `${rightPanelWidth.value}px`,
}))

// 约束左右面板宽度，保证中间预览区最小可用空间
const clampPanelWidths = () => {
  if (!shellRef.value) {
    return
  }

  const shellWidth = shellRef.value.clientWidth
  const maxTotalSideWidth = Math.max(shellWidth - previewMin - splitterWidth * 2, 0)
  const minTotalSideWidth = leftPanelMin + rightPanelMin

  if (maxTotalSideWidth <= minTotalSideWidth) {
    leftPanelWidth.value = leftPanelMin
    rightPanelWidth.value = rightPanelMin
    return
  }

  const currentTotal = leftPanelWidth.value + rightPanelWidth.value

  if (currentTotal <= maxTotalSideWidth) {
    return
  }

  const overflow = currentTotal - maxTotalSideWidth
  const reducibleLeft = leftPanelWidth.value - leftPanelMin
  const reduceLeft = Math.min(reducibleLeft, Math.ceil(overflow / 2))

  leftPanelWidth.value -= reduceLeft

  const remainingOverflow = overflow - reduceLeft
  rightPanelWidth.value = Math.max(rightPanelMin, rightPanelWidth.value - remainingOverflow)
}

// 根据当前鼠标位置调整左右面板宽度
const resizeFromClientX = (clientX: number) => {
  if (!shellRef.value || !activeResizeSide) {
    return
  }

  const shellBounds = shellRef.value.getBoundingClientRect()
  const shellWidth = shellBounds.width
  const fixedWidth = splitterWidth * 2

  if (activeResizeSide === 'left') {
    const maxLeft = Math.max(
      leftPanelMin,
      shellWidth - rightPanelWidth.value - fixedWidth - previewMin,
    )
    const nextLeft = Math.min(Math.max(clientX - shellBounds.left, leftPanelMin), maxLeft)

    leftPanelWidth.value = nextLeft
    return
  }

  const maxRight = Math.max(
    rightPanelMin,
    shellWidth - leftPanelWidth.value - fixedWidth - previewMin,
  )
  const nextRight = Math.min(Math.max(shellBounds.right - clientX, rightPanelMin), maxRight)

  rightPanelWidth.value = nextRight
}

// 停止当前分隔线拖拽
const stopResize = () => {
  activeResizeSide = null
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
}

// 拖拽过程中持续同步宽度
const handlePointerMove = (event: PointerEvent) => {
  resizeFromClientX(event.clientX)
}

// 鼠标抬起时结束拖拽
const handlePointerUp = () => {
  stopResize()
}

// 开始拖拽指定方向的分隔线
const startResize = (side: ResizeSide, event: PointerEvent) => {
  event.preventDefault()
  activeResizeSide = side
  resizeFromClientX(event.clientX)
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
}

onMounted(() => {
  clampPanelWidths()

  if (!shellRef.value) {
    return
  }

  shellResizeObserver = new ResizeObserver(() => {
    clampPanelWidths()
  })

  shellResizeObserver.observe(shellRef.value)
})

onBeforeUnmount(() => {
  stopResize()
  shellResizeObserver?.disconnect()
  shellResizeObserver = null
})
</script>

<template>
  <div class="page-shell">
    <main
      ref="shellRef"
      class="shell"
      :style="shellStyle"
    >
      <ProjectListPanel />

      <div
        class="splitter"
        role="separator"
        aria-label="调整左侧面板宽度"
        aria-orientation="vertical"
        @pointerdown="startResize('left', $event)"
      />

      <section class="preview-panel">
        <PreviewCanvas />
      </section>

      <div
        class="splitter"
        role="separator"
        aria-label="调整右侧面板宽度"
        aria-orientation="vertical"
        @pointerdown="startResize('right', $event)"
      />

      <ProjectConfigPanel />
    </main>
  </div>
</template>

<style scoped>
.page-shell {
  height: 100svh;
  min-height: 100svh;
  background: #e7e9ec;
}

.shell {
  width: 100%;
  height: 100svh;
  min-height: 100svh;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns:
    var(--left-panel-width, 220px)
    6px
    minmax(0, 1fr)
    6px
    var(--right-panel-width, 260px);
  gap: 0;
  align-items: stretch;
}

.preview-panel {
  min-width: 0;
  min-height: 0;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e1e4e8;
}

.splitter {
  position: relative;
  background: #d0d7de;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}

.splitter::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, transparent 0, transparent 30%, rgba(87, 96, 106, 0.4) 30%, rgba(87, 96, 106, 0.4) 70%, transparent 70%, transparent 100%);
  opacity: 0.5;
}

.splitter:hover,
.splitter:active {
  background: #b6bec8;
}

@media (max-width: 960px) {
  .shell {
    grid-template-columns:
      minmax(180px, var(--left-panel-width, 200px))
      6px
      minmax(0, 1fr)
      6px
      minmax(200px, var(--right-panel-width, 220px));
  }
}

@media (max-width: 860px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    padding: 8px;
  }

  .splitter {
    display: none;
  }
}
</style>
