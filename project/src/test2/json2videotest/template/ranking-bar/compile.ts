import type { Json2VideoRuntimeConfig } from '../../type/type-a-b.ts'
import type { CompiledNode, CompiledScene } from '../../type/type-b-c.ts'
import {
  createRankingBarChartNodes,
  createRectNode,
  createTextBlockNodes,
} from '../../prefab/prefabs'
import type { RankingBarDataSource, RankingBarTemplate } from './types'

// 把横向排行模板编译成统一场景
export const compileRankingBarTemplate = (
  config: Json2VideoRuntimeConfig,
  dataSource: RankingBarDataSource,
  template: RankingBarTemplate,
): CompiledScene => {
  const viewport = config.viewport
  const nodes: CompiledNode[] = []

  for (const block of template.backgroundBlocks) {
    nodes.push(
      createRectNode({
        alpha: block.alpha,
        fill: block.fill,
        height: viewport.height * block.heightPercent,
        width: viewport.width * block.widthPercent,
        x: viewport.width * block.xPercent,
        y: viewport.height * block.yPercent,
      }),
    )
  }

  nodes.push(
    createRectNode({
      fill: template.badge.fill,
      height: template.badge.height,
      width: template.badge.width,
      x: viewport.width * template.badge.xPercent,
      y: viewport.height * template.badge.yPercent,
    }),
  )

  nodes.push(
    ...createTextBlockNodes(
      viewport,
      template.textLines.map((line) => {
        return {
          anchorX: line.anchorX,
          anchorY: line.anchorY,
          style: line.style,
          text: dataSource.config[line.textKey],
          xPercent: line.xPercent,
          yPercent: line.yPercent,
        }
      }),
    ),
  )

  nodes.push(
    ...createRankingBarChartNodes(
      viewport,
      template.rankingLayout,
      dataSource.items,
      {
        left: dataSource.config.leftMetricLabel,
        right: dataSource.config.rightMetricLabel,
      },
    ),
  )

  return {
    background: config.background,
    height: viewport.height,
    nodes,
    width: viewport.width,
  }
}
