import type { ZodType } from 'zod'
import type { Json2VideoRuntimeConfig } from '../type/type-a-b.ts'
import type { CompiledScene } from '../type/type-b-c.ts'

// 模板定义，负责把配置和数据源编译成统一场景
export type TemplateDefinition<TDataSource = unknown> = {
  compile: (input: {
    config: Json2VideoRuntimeConfig
    dataSource: TDataSource
  }) => CompiledScene
  dataSourceSchema: ZodType<TDataSource>
  id: string
}

export type AnyTemplateDefinition = TemplateDefinition<unknown>

// 在模板注册表层擦除具体模板的数据源类型
export const asAnyTemplateDefinition = <TDataSource>(
  template: TemplateDefinition<TDataSource>,
): AnyTemplateDefinition => {
  return template as unknown as AnyTemplateDefinition
}
