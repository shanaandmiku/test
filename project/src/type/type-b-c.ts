import type { TextStyleFontWeight } from 'pixi.js'

// B 层和 C 层共享的编译文本节点
export type CompiledTextNode = {
  type: 'text'
  anchorX: number
  anchorY: number
  direction: 'horizontal' | 'vertical'
  style: {
    fill: string
    fontFamily: string
    fontSize: number
    fontWeight: TextStyleFontWeight
  }
  text: string
  x: number
  y: number
}

// B 层和 C 层共享的编译矩形节点
export type CompiledRectNode = {
  type: 'rect'
  alpha?: number
  fill: string
  height: number
  width: number
  x: number
  y: number
}

export type CompiledNode = CompiledTextNode | CompiledRectNode

// B 层和 C 层共享的编译场景
export type CompiledScene = {
  background: number
  height: number
  nodes: CompiledNode[]
  width: number
}
