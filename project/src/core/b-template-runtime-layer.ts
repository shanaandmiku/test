import type { AnyTemplateDefinition } from './template/template-definition.ts'
import type { Json2VideoRuntimeConfig } from './type/type-a-b.ts'
import type { CompiledScene } from './type/type-b-c.ts'

export type CompileTemplateInput = {
  config: Json2VideoRuntimeConfig
  dataSource: unknown
  template: AnyTemplateDefinition
}

// 模板运行时负责调度具体模板定义进行编译
export const compileTemplate = ({
  config,
  dataSource,
  template,
}: CompileTemplateInput): CompiledScene => {
  const parsedDataSource = template.dataSourceSchema.parse(dataSource)

  return template.compile({ config, dataSource: parsedDataSource })
}
