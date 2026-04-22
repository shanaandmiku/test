import {
  createTemplatePluginId,
  type TemplatePluginDefinition,
} from '@chartclip/shared'

// 用一个最小示例验证 project 可以直接消费 shared 包。
export const sharedTemplatePluginExample: TemplatePluginDefinition = {
  name: createTemplatePluginId('project', 'example'),
}
