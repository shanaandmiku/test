import type { TextStyleFontWeight } from 'pixi.js'

// C 层和 D 层共享的文本图层 IR
export type TextLayerIr = {
  type: 'text'
  anchorX: number
  anchorY: number
  direction: 'horizontal' | 'vertical'
  fill: string
  fontFamily: string
  fontSize: number
  fontWeight: TextStyleFontWeight
  text: string
  x: number
  y: number
}

export type RectLayerIr = {
  type: 'rect'
  alpha?: number
  fill: string
  height: number
  width: number
  x: number
  y: number
}

export type LayerIr = TextLayerIr | RectLayerIr

// C 层和 D 层共享的单场景 IR
export type SceneIr = {
  background: number
  height: number
  layers: LayerIr[]
  width: number
}

// C 层和 D 层共享的影片 IR
export type MovieIr = {
  scenes: SceneIr[]
}
