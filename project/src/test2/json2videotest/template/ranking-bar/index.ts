import rankingBarTemplateJson from './template.json'
import { compileRankingBarTemplate } from './compile'
import type { TemplateDefinition } from '../template-definition'
import {
  rankingBarDataSourceSchema,
  rankingBarTemplateSchema,
  type RankingBarDataSource,
} from './types'

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
