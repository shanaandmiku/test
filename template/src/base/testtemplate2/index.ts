import type { TemplatePluginContext } from '../../type.ts'

export default function createPlugin(ctx: TemplatePluginContext) {
  return {
    name: ctx.shared.createTemplatePluginId('base', 'testtemplate2'),
  }
}
