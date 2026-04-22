import type { Json2VideoRuntimeConfig } from '../../type/type-a-b.ts'
import type { CompiledNode, CompiledScene } from '../../type/type-b-c.ts'
import {
  createGroupedColumnChartNodes,
  createLegendRowNodes,
  createRectNode,
  createTextBlockNodes,
} from '../../prefab/prefabs.ts'
import type {
  GroupedColumnDataSource,
  GroupedColumnTemplate,
} from './types.ts'

// 把分组竖柱模板编译成统一场景
export const compileGroupedColumnTemplate = (
  config: Json2VideoRuntimeConfig,
  dataSource: GroupedColumnDataSource,
  template: GroupedColumnTemplate,
): CompiledScene => {
  const viewport = config.viewport
  const nodes: CompiledNode[] = []

  nodes.push(
    createRectNode({
      alpha: template.panel.alpha,
      fill: template.panel.fill,
      height: viewport.height * template.panel.heightPercent,
      width: viewport.width * template.panel.widthPercent,
      x: viewport.width * template.panel.xPercent,
      y: viewport.height * template.panel.yPercent,
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
    ...createLegendRowNodes(
      viewport,
      template.legendLayout,
      dataSource.series.map((item) => {
        return {
          color: item.color,
          label: item.label,
        }
      }),
      template.legendTextStyle,
    ),
  )

  nodes.push(
    ...createGroupedColumnChartNodes(
      viewport,
      template.chartLayout,
      dataSource.categories,
      dataSource.series,
      dataSource.points,
    ),
  )

  return {
    background: config.background,
    height: viewport.height,
    nodes,
    width: viewport.width,
  }
}
