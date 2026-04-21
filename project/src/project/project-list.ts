import { ref } from 'vue'

import type { ProjectListItemView } from './project-store-types'

export type ProjectListItem = ProjectListItemView

export class ProjectListState {
  items: ProjectListItem[]
  selectedProjectId: string

  constructor() {
    this.items = []
    this.selectedProjectId = ''
  }
}

export const projectListRef = ref(new ProjectListState())
