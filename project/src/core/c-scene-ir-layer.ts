import type { MovieIr, RectLayerIr, TextLayerIr } from '../type/type-c-d.ts'
import type {
  CompiledNode,
  CompiledRectNode,
  CompiledScene,
  CompiledTextNode,
} from '../type/type-b-c.ts'

const createTextLayerIr = (node: CompiledTextNode): TextLayerIr => {
  return {
    type: 'text',
    anchorX: node.anchorX,
    anchorY: node.anchorY,
    direction: node.direction,
    fill: node.style.fill,
    fontFamily: node.style.fontFamily,
    fontSize: node.style.fontSize,
    fontWeight: node.style.fontWeight,
    text: node.text,
    x: node.x,
    y: node.y,
  }
}

const createRectLayerIr = (node: CompiledRectNode): RectLayerIr => {
  return {
    type: 'rect',
    alpha: node.alpha,
    fill: node.fill,
    height: node.height,
    width: node.width,
    x: node.x,
    y: node.y,
  }
}

const createLayerIr = (node: CompiledNode) => {
  if (node.type === 'text') {
    return createTextLayerIr(node)
  }

  return createRectLayerIr(node)
}

// 把模板编译结果转换成统一的场景 IR
export const buildMovieIr = (compiledScene: CompiledScene): MovieIr => {
  return {
    scenes: [
      {
        background: compiledScene.background,
        height: compiledScene.height,
        layers: compiledScene.nodes.map(createLayerIr),
        width: compiledScene.width,
      },
    ],
  }
}
