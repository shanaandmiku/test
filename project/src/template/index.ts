import { groupedColumnTemplateDefinition } from './grouped-column'
import { rankingBarTemplateDefinition } from './ranking-bar'
import { centeredTextTemplate } from './single-text-template'
import { asAnyTemplateDefinition } from './template-definition.ts'
import type { AnyTemplateDefinition } from './template-definition.ts'

const templateMap: Record<string, AnyTemplateDefinition> = {
  'grouped-column-template': asAnyTemplateDefinition(
    groupedColumnTemplateDefinition,
  ),
  'ranking-bar-template': asAnyTemplateDefinition(
    rankingBarTemplateDefinition,
  ),
  'single-text-template': asAnyTemplateDefinition(centeredTextTemplate),
}

// 根据模板 id 获取模板定义
export const getTemplateById = (templateId: string): AnyTemplateDefinition => {
  const template = templateMap[templateId]

  if (!template) {
    throw new Error(`未找到模板: ${templateId}`)
  }

  return template
}
