// 用统一规则生成模板插件名，避免各处手写字符串。
export class TemplatePluginId {
  public readonly scope: string
  public readonly name: string

  public constructor(scope: string, name: string) {
    this.scope = scope
    this.name = name
  }

  public toString(): string {
    return `${this.scope}-${this.name}`
  }
}

export const createTemplatePluginId = (scope: string, name: string): string => {
  return new TemplatePluginId(scope, name).toString()
}
