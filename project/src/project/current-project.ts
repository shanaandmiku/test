import { ref } from 'vue'

import type { ProjectRecord } from './project-model'

export * from './project-model'

// 兼容旧引用的占位导出，实际状态请改用 useProjectStore。
export const currentProjectRef = ref<ProjectRecord | null>(null)
