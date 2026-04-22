<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { RenderSession } from '../type/type-d-z.ts'
import {
  getWorkSpace,
  requestPermission,
  selectWorkSpace,
  verifyPermission,
} from '../utils/file-util.ts'
import { runtimeConfig } from '../config/runtime-config.ts'
import JSONEditor, { JSONEditorMode } from 'jsoneditor'
import {
  type IDataLayerResult,
  type IOrigInfo,
  normalizeData2,
} from '../core/a-data-layer.ts'
import { initWorkSpace } from '../core/utils/workspace.ts'

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

const initFlag = ref(false)
const initEdFlag = ref(false)
watch(
  () => [workspaceRef.value, workspacePermission.value],
  () => {
    if (workspaceRef.value && workspacePermission.value && !initFlag.value) {
      initFlag.value = true
      initWorkSpace(workspaceRef.value).then(() => {
        initEdFlag.value = true
      })
    }
  },
)

onMounted(async () => {
  workspaceRef.value = await getWorkSpace()
  if (workspaceRef.value && (await verifyPermission(workspaceRef.value))) {
    workspacePermission.value = true
  }
})

onBeforeUnmount(() => {
  runtime?.destroy()
  runtime = null
  for (let oldEditorElement of oldEditor) {
    oldEditorElement?.destroy?.()
  }
})

const origInfoRef = ref<HTMLDivElement | null>(null)
const normalizedRef = ref<HTMLDivElement | null>(null)
// const origInfoRef = ref<HTMLDivElement | null>(null)
// const origInfoRef = ref<HTMLDivElement | null>(null)

const origInfo = ref<IOrigInfo | null>(null)
const getOrigInfo = (): IOrigInfo | null => {
  if (!workspaceRef.value || !workspacePermission.value) {
    return null
  }
  return {
    runtimeConfig: runtimeConfig,
    projectId: 'project1',
  }
}

const normalized = ref<IDataLayerResult | null>(null)
const getNormalized = async (): Promise<IDataLayerResult | null> => {
  if (!origInfo.value || !workspaceRef.value) {
    return null
  }
  return normalizeData2(
    {
      ...origInfo.value,
    },
    workspaceRef.value,
  )
}

watch(
  () => [initEdFlag.value],
  async () => {
    origInfo.value = await getOrigInfo()
    normalized.value = await getNormalized()
  },
)

const oldEditor: JSONEditor[] = []
watch(
  () => [origInfo.value, normalized.value],
  () => {
    for (let oldEditorElement of oldEditor) {
      oldEditorElement?.destroy?.()
    }
    oldEditor.length = 0

    if (!origInfo.value) {
      return
    }

    const options: {
      mode: JSONEditorMode
      modes: JSONEditorMode[]
      sortObjectKeys: boolean
    } = {
      mode: 'view',
      modes: ['tree', 'tree'],
      sortObjectKeys: true,
    }
    const origInfoEditor = new JSONEditor(
      origInfoRef.value as HTMLElement,
      options,
      origInfo.value,
    )
    origInfoEditor.expandAll()
    const normalizedEditor = new JSONEditor(
      normalizedRef.value as HTMLElement,
      options,
      normalized.value,
    )
    normalizedEditor.expandAll()
    oldEditor.push(origInfoEditor, normalizedEditor)
  },
)
</script>

<template>
  <section class="test-page">
    <div class="test-canvas-host" style="display: flex; flex-direction: column">
      <div style="flex: 0">
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
      <div ref="origInfoRef" style="flex: 1"></div>
    </div>
    <div ref="normalizedRef" class="test-canvas-host" />
    <div class="test-canvas-host">
      {{ normalized }}
    </div>
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
