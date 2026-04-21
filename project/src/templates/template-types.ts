import type { ProjectRecord, ProjectTemplateKind } from '../project/project-model'

/** 通用字段可绑定的资源目录。 */
export type TemplateFieldOptionSource =
  | 'backgroundPresetCatalog'
  | 'colorPaletteCatalog'
  | 'resolutionCatalog'

/** 通用声明式字段。 */
export type TemplateFieldSchema =
  | {
      id: string
      label: string
      path: string
      type: 'text'
    }
  | {
      id: string
      label: string
      path: string
      rows?: number
      type: 'textarea'
    }
  | {
      id: string
      label: string
      max?: number
      min?: number
      path: string
      step?: number
      type: 'number'
    }
  | {
      id: string
      label: string
      path: string
      type: 'toggle'
    }
  | {
      id: string
      label: string
      options?: Array<{ label: string, value: string }>
      optionsSource?: TemplateFieldOptionSource
      path: string
      type: 'select'
    }
  | {
      id: string
      label: string
      path: string
      type: 'color'
    }

/** 一组声明式字段。 */
export interface FieldGroupSchema {
  fields: TemplateFieldSchema[]
  id: string
  title: string
}

/** 生成默认项目时需要的元信息。 */
export interface CreateProjectSeed {
  id: string
  name: string
  summary: string
  updatedAt: string
}

/** 模板注册定义。 */
export interface TemplateDefinition {
  advancedStyleGroups: FieldGroupSchema[]
  basicInfoGroups: FieldGroupSchema[]
  createDefaultProject: (seed: CreateProjectSeed) => ProjectRecord
  dataEditorKind: 'grouped-matrix' | 'ranking-list'
  kind: ProjectTemplateKind
  label: string
}
