import type { ProjectTemplateKind } from '../project/project-model'
import { createGroupedColumnProject } from './grouped-column/defaults'
import { groupedColumnAdvancedStyleGroups } from './grouped-column/advanced-style-schema'
import { groupedColumnBasicInfoGroups } from './grouped-column/basic-info-schema'
import { createRankingBarProject } from './ranking-bar/defaults'
import { rankingBarAdvancedStyleGroups } from './ranking-bar/advanced-style-schema'
import { rankingBarBasicInfoGroups } from './ranking-bar/basic-info-schema'
import type { TemplateDefinition } from './template-types'

const templateDefinitions: Record<ProjectTemplateKind, TemplateDefinition> = {
  'grouped-column': {
    advancedStyleGroups: groupedColumnAdvancedStyleGroups,
    basicInfoGroups: groupedColumnBasicInfoGroups,
    createDefaultProject: createGroupedColumnProject,
    dataEditorKind: 'grouped-matrix',
    kind: 'grouped-column',
    label: '分组竖柱',
  },
  'ranking-bar': {
    advancedStyleGroups: rankingBarAdvancedStyleGroups,
    basicInfoGroups: rankingBarBasicInfoGroups,
    createDefaultProject: createRankingBarProject,
    dataEditorKind: 'ranking-list',
    kind: 'ranking-bar',
    label: '横向排行',
  },
}

// 获取指定模板的注册定义。
export function getTemplateDefinition(kind: ProjectTemplateKind): TemplateDefinition {
  return templateDefinitions[kind]
}

// 获取模板下拉选项。
export function getTemplateOptions(): Array<{ label: string, value: ProjectTemplateKind }> {
  return Object.values(templateDefinitions).map((definition) => ({
    label: definition.label,
    value: definition.kind,
  }))
}
