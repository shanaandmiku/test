import type { ProjectRecord, ProjectTemplateKind } from './project-model'

/** 项目仓库存储结构。 */
export interface ProjectStoreState {
  order: string[]
  records: Record<string, ProjectRecord>
  selectedProjectId: string
}

/** 左侧项目列表使用的派生视图。 */
export interface ProjectListItemView {
  id: string
  name: string
  summary: string
  templateKind: ProjectTemplateKind
  updatedAt: string
}
