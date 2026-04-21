<script setup lang="ts">
import { computed, ref } from 'vue'

import { useProjectStore } from '../project/project-store'
import { getTemplateDefinition, getTemplateOptions } from '../templates/template-registry'

const projectStore = useProjectStore()

const projectCount = computed(() => projectStore.projectListItems.length)
const projectList = computed(() => projectStore.projectListItems)
const selectedProjectId = computed(() => projectStore.state.selectedProjectId)
const templateOptions = computed(() => getTemplateOptions())
const isCreateFormVisible = ref(false)
const newProjectName = ref('')
const newTemplateKind = ref<'grouped-column' | 'ranking-bar'>('grouped-column')
const editingProjectId = ref('')
const editingProjectName = ref('')

// 打开新建项目表单。
function openCreateForm(): void {
  isCreateFormVisible.value = true
  newProjectName.value = ''
  newTemplateKind.value = 'grouped-column'
}

// 关闭新建项目表单。
function closeCreateForm(): void {
  isCreateFormVisible.value = false
  newProjectName.value = ''
}

// 创建项目。
function submitCreateProject(): void {
  projectStore.createProject(newTemplateKind.value, newProjectName.value)
  closeCreateForm()
}

// 选中某个项目。
function selectProject(projectId: string): void {
  projectStore.selectProject(projectId)
}

// 开始重命名。
function startRename(projectId: string, currentName: string): void {
  editingProjectId.value = projectId
  editingProjectName.value = currentName
}

// 提交重命名。
function submitRename(projectId: string): void {
  projectStore.updateProjectMeta(projectId, {
    name: editingProjectName.value,
  })
  editingProjectId.value = ''
  editingProjectName.value = ''
}

// 取消重命名。
function cancelRename(): void {
  editingProjectId.value = ''
  editingProjectName.value = ''
}

// 复制项目。
function duplicateProject(projectId: string): void {
  projectStore.duplicateProject(projectId)
}

// 删除项目。
function deleteProject(projectId: string): void {
  projectStore.deleteProject(projectId)
}

// 获取模板显示名。
function getTemplateLabel(templateKind: 'grouped-column' | 'ranking-bar'): string {
  return getTemplateDefinition(templateKind).label
}
</script>

<template>
  <aside class="side-panel">
    <div class="panel-header">
      <div>
        <h2>项目列表</h2>
        <p>{{ projectCount }} 个项目</p>
      </div>
      <button
        type="button"
        @click="openCreateForm"
      >
        新建
      </button>
    </div>

    <div
      v-if="isCreateFormVisible"
      class="create-form"
    >
      <label class="field">
        <span class="field-label">项目名称</span>
        <input
          v-model="newProjectName"
          type="text"
        >
      </label>
      <label class="field">
        <span class="field-label">模板类型</span>
        <select v-model="newTemplateKind">
          <option
            v-for="option in templateOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
      <div class="action-row">
        <button
          type="button"
          @click="submitCreateProject"
        >
          创建
        </button>
        <button
          type="button"
          @click="closeCreateForm"
        >
          取消
        </button>
      </div>
    </div>

    <div class="card-stack">
      <div
        v-for="item in projectList"
        :key="item.id"
        :class="[
          'project-card',
          { 'is-active': item.id === selectedProjectId },
        ]"
        @click="selectProject(item.id)"
      >
        <template v-if="editingProjectId === item.id">
          <label class="field">
            <span class="field-label">项目名称</span>
            <input
              v-model="editingProjectName"
              type="text"
            >
          </label>
          <div class="action-row">
            <button
              type="button"
              @click.stop="submitRename(item.id)"
            >
              保存
            </button>
            <button
              type="button"
              @click.stop="cancelRename"
            >
              取消
            </button>
          </div>
        </template>
        <template v-else>
          <span class="project-title">{{ item.name }}</span>
          <span class="project-meta">{{ item.summary }}</span>
          <span class="project-meta">{{ getTemplateLabel(item.templateKind) }}</span>
          <span class="project-time">{{ item.updatedAt }}</span>
          <div
            v-if="item.id === selectedProjectId"
            class="action-row"
          >
            <button
              type="button"
              @click.stop="startRename(item.id, item.name)"
            >
              重命名
            </button>
            <button
              type="button"
              @click.stop="duplicateProject(item.id)"
            >
              复制
            </button>
            <button
              type="button"
              @click.stop="deleteProject(item.id)"
            >
              删除
            </button>
          </div>
        </template>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.side-panel {
  min-width: 0;
  min-height: 0;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f3f4f6;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.panel-header {
  padding: 2px 0 8px;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid var(--line);
}

.panel-header h2 {
  color: var(--ink-strong);
  font-size: 13px;
  line-height: 1.4;
  font-weight: 600;
}

.panel-header p {
  margin-top: 2px;
  font-size: 12px;
  color: var(--ink-muted);
}

.create-form,
.project-card {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--line);
  background: #ffffff;
}

.project-card {
  cursor: pointer;
}

.project-card.is-active {
  border-color: #b9c3d4;
  background: #eef4ff;
}

.card-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  font-size: 12px;
  color: var(--ink-muted);
}

.project-title {
  color: var(--ink-strong);
  font-size: 13px;
  font-weight: 500;
}

.project-time,
.project-meta {
  font-size: 12px;
  color: var(--ink-muted);
}

.action-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
