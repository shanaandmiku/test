import rankingBarTemplateJson from './template.json'
import { compileRankingBarTemplate } from './compile.ts'
import type { TemplateDefinition } from '../template-definition.ts'
import {
  rankingBarDataSourceSchema,
  rankingBarTemplateSchema,
  type RankingBarDataSource,
} from './types.ts'

const rankingBarTemplate = rankingBarTemplateSchema.parse(rankingBarTemplateJson)

export const rankingBarTemplateDefinition: TemplateDefinition<RankingBarDataSource> =
  {
    compile: ({ config, dataSource }) => {
      return compileRankingBarTemplate(
        config,
        dataSource,
        rankingBarTemplate,
      )
    },
    dataSourceSchema: rankingBarDataSourceSchema,
    id: 'ranking-bar-template',
  }
