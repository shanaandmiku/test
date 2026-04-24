export interface TemplatePluginContext {
  shared: {
    createTemplatePluginId(scope: string, name: string): string
  }
}
