import type { ProjectRecord, ProjectTemplateKind } from './project-model'
import { clonePlainData, createRandomId, formatDateTime } from '../util/common'
import { getTemplateDefinition } from '../templates/template-registry'

// 根据模板类型创建一个新项目。
export function createProjectRecord(
  templateKind: ProjectTemplateKind,
  name?: string,
): ProjectRecord {
  const definition = getTemplateDefinition(templateKind)
  const timestamp = formatDateTime()
  const projectName = name?.trim() || getDefaultProjectName(templateKind)

  return definition.createDefaultProject({
    id: createRandomId('project'),
    name: projectName,
    summary: getDefaultProjectSummary(templateKind),
    updatedAt: timestamp,
  })
}

// 复制项目时生成一个新记录，保留内容但刷新元信息。
export function duplicateProjectRecord(sourceProject: ProjectRecord): ProjectRecord {
  const nextProject = clonePlainData(sourceProject)

  nextProject.meta.id = createRandomId('project')
  nextProject.meta.name = `${sourceProject.meta.name} 副本`
  nextProject.meta.updatedAt = formatDateTime()

  return nextProject
}

// 根据模板类型给出默认项目名。
function getDefaultProjectName(templateKind: ProjectTemplateKind): string {
  return templateKind === 'grouped-column' ? '分组对比图表' : '横向排行图表'
}

// 根据模板类型给出默认摘要。
function getDefaultProjectSummary(templateKind: ProjectTemplateKind): string {
  return templateKind === 'grouped-column'
    ? '多系列分组柱状对比'
    : '横向排行条形对比'
}
