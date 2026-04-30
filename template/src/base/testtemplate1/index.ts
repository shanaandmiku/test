import type { TemplatePluginContext, TemplatePluginResult } from '../../type.ts'

export default function createPlugin(
  ctx: TemplatePluginContext,
): TemplatePluginResult {
  return {
    name: ctx.shared.createTemplatePluginId('base', 'testtemplate1'),
  }
}
