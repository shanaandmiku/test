// 入参
export interface TemplatePluginContext {
  shared: {
    createTemplatePluginId(scope: string, name: string): string
  }
}

// 返回
export interface TemplatePluginResult {
  name: string
}
