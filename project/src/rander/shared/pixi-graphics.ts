import { Graphics } from 'pixi.js'

import type { ProjectResolutionOption } from '../../project/project-types'

export type PreviewViewport = {
  height: number
  scale: number
  width: number
}

// 将数值限制在给定区间内。
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// 根据容器尺寸计算预览画面的实际显示尺寸。
export function getViewportSize(
  frameWidth: number,
  frameHeight: number,
  resolution: ProjectResolutionOption,
): PreviewViewport {
  const nextScale = Math.min(frameWidth / resolution.width, frameHeight / resolution.height)
  const scale = Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1

  return {
    width: resolution.width * scale,
    height: resolution.height * scale,
    scale,
  }
}

// 绘制一条横向虚线。
export function drawDashedLine(
  graphics: Graphics,
  x: number,
  y: number,
  width: number,
  dashLength: number,
  gapLength: number,
  color: number,
  alpha: number,
): void {
  let cursorX = x
  const endX = x + width

  while (cursorX < endX) {
    const segmentEndX = Math.min(cursorX + dashLength, endX)

    graphics
      .moveTo(cursorX, y)
      .lineTo(segmentEndX, y)
      .stroke({ color, width: 2, alpha })

    cursorX += dashLength + gapLength
  }
}
