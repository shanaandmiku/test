import groupedColumnTemplateJson from './template.json'
import { compileGroupedColumnTemplate } from './compile'
import type { TemplateDefinition } from '../template-definition'
import {
  groupedColumnDataSourceSchema,
  groupedColumnTemplateSchema,
  type GroupedColumnDataSource,
} from './types'

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
