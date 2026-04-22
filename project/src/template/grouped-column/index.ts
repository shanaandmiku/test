import groupedColumnTemplateJson from './template.json'
import { compileGroupedColumnTemplate } from './compile.ts'
import type { TemplateDefinition } from '../template-definition.ts'
import {
  groupedColumnDataSourceSchema,
  groupedColumnTemplateSchema,
  type GroupedColumnDataSource,
} from './types.ts'

const groupedColumnTemplate = groupedColumnTemplateSchema.parse(
  groupedColumnTemplateJson,
)

export const groupedColumnTemplateDefinition: TemplateDefinition<GroupedColumnDataSource> =
  {
    compile: ({ config, dataSource }) => {
      return compileGroupedColumnTemplate(
        config,
        dataSource,
        groupedColumnTemplate,
      )
    },
    dataSourceSchema: groupedColumnDataSourceSchema,
    id: 'grouped-column-template',
  }
