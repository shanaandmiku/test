import { Graphics } from 'pixi.js'

import type { BackgroundPresetCatalogItem } from '../../project/resource-catalogs'

// 按预设绘制背景。
export function drawBackground(
  graphics: Graphics,
  width: number,
  height: number,
  preset: BackgroundPresetCatalogItem,
): void {
  graphics.clear()

  if (preset.kind === 'solid') {
    graphics
      .rect(0, 0, width, height)
      .fill(preset.fill)
    return
  }

  const topColor = preset.topColor ?? preset.fill
  const bottomColor = preset.bottomColor ?? preset.fill
  const steps = 48

  for (let index = 0; index < steps; index += 1) {
    const progress = steps <= 1 ? 1 : index / (steps - 1)
    const nextY = (height / steps) * index
    const nextHeight = Math.ceil(height / steps) + 1

    graphics
      .rect(0, nextY, width, nextHeight)
      .fill(interpolateColor(topColor, bottomColor, progress))
  }

  if (typeof preset.overlayColor === 'number' && typeof preset.overlayAlpha === 'number') {
    graphics
      .rect(0, 0, width, height)
      .fill({
        color: preset.overlayColor,
        alpha: preset.overlayAlpha,
      })
  }
}

// 对两种颜色做线性插值。
function interpolateColor(startColor: number, endColor: number, progress: number): number {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const startRed = (startColor >> 16) & 0xff
  const startGreen = (startColor >> 8) & 0xff
  const startBlue = startColor & 0xff
  const endRed = (endColor >> 16) & 0xff
  const endGreen = (endColor >> 8) & 0xff
  const endBlue = endColor & 0xff
  const red = Math.round(startRed + (endRed - startRed) * clampedProgress)
  const green = Math.round(startGreen + (endGreen - startGreen) * clampedProgress)
  const blue = Math.round(startBlue + (endBlue - startBlue) * clampedProgress)

  return (red << 16) + (green << 8) + blue
}
