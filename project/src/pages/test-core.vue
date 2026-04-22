<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createJson2VideoRuntime } from '../core/z-core.ts'
import type { RenderSession } from '../type/type-d-z.ts'
import {
  getAndSelectWorkSpace,
  getWorkSpace,
  requestPermission,
  selectWorkSpace,
  verifyPermission,
} from '../util/file-util.ts'

// Pixi 挂载节点
const hostRef = ref<HTMLDivElement | null>(null)

let runtime: RenderSession | null = null

// const mountRuntime = async (): Promise<void> => {
//   if (!hostRef.value) {
//     return
//   }
//
//   runtime?.destroy()
//   runtime = await createJson2VideoRuntime(hostRef.value, {
//     project: '',
//   })
// }

const workspaceRef = ref<FileSystemDirectoryHandle | null>(null)
const workspacePermission = ref(false)
const selectWorkSpaceHandler = async (): Promise<void> => {
  workspaceRef.value = await getWorkSpace()
  if (workspaceRef.value) {
    workspacePermission.value = await verifyPermission(workspaceRef.value)
  } else {
    workspaceRef.value = await selectWorkSpace()
    workspacePermission.value = true
  }
}
const changeWorkSpaceHandler = async (): Promise<void> => {
  workspaceRef.value = await selectWorkSpace()
  workspacePermission.value = true
}
const permissionAccess = async (): Promise<void> => {
  if (!workspaceRef.value) {
    alert('请选择工作目录')
    return
  }
  workspacePermission.value = await requestPermission(workspaceRef.value)
}

onMounted(async () => {
  workspaceRef.value = await getWorkSpace()
  if (workspaceRef.value && (await verifyPermission(workspaceRef.value))) {
    workspacePermission.value = true
  }
})

onBeforeUnmount(() => {
  runtime?.destroy()
  runtime = null
})

const
</script>

<template>
  <section class="test-page">
    <div class="test-canvas-host">
      当前工作目录：{{ workspaceRef?.name }}
      <button v-if="!workspaceRef" @click="selectWorkSpaceHandler">
        选择工作目录
      </button>
      <button v-if="workspaceRef" @click="changeWorkSpaceHandler">
        切换工作目录
      </button>
      <button v-if="!workspacePermission" @click="permissionAccess">
        授权访问
      </button>
    </div>
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
