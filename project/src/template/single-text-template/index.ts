import singleTextTemplateJson from './template.json'
import { compileSingleTextTemplate } from './compile.ts'
import type { TemplateDefinition } from '../template-definition.ts'
import {
  singleTextTemplateLayoutSchema,
  simpleTextTemplateDataSourceSchema,
  type SimpleTextTemplateDataSource,
} from './types.ts'

const singleTextTemplateLayout = singleTextTemplateLayoutSchema.parse(
  singleTextTemplateJson,
)

// 当前实验的模板定义
export const centeredTextTemplate: TemplateDefinition<SimpleTextTemplateDataSource> = {
  compile: ({ config, dataSource }) => {
    return compileSingleTextTemplate(
      config,
      dataSource,
      singleTextTemplateLayout,
    )
  },
  dataSourceSchema: simpleTextTemplateDataSourceSchema,
  id: 'single-text-template',
}
