import type { ProjectResolutionOption } from './project-types'

/** 可选字体目录项。 */
export interface FontCatalogItem {
  fontFamily: string
  id: string
  label: string
}

/** 调色板目录项。 */
export interface ColorPaletteCatalogItem {
  colors: number[]
  id: string
  label: string
}

/** 背景预设目录项。 */
export interface BackgroundPresetCatalogItem {
  bottomColor?: number
  fill: number
  id: string
  label: string
  kind: 'solid' | 'vertical-gradient'
  overlayAlpha?: number
  overlayColor?: number
  topColor?: number
}

/** 应用内置的字体目录。 */
export const defaultFontCatalog: FontCatalogItem[] = [
  {
    id: 'font-space-grotesk',
    label: 'Space Grotesk',
    fontFamily: 'Space Grotesk',
  },
  {
    id: 'font-ibm-plex-mono',
    label: 'IBM Plex Mono',
    fontFamily: 'IBM Plex Mono',
  },
]

/** 应用内置的导出分辨率。 */
export const defaultResolutionCatalog: ProjectResolutionOption[] = [
  { id: 'resolution-4k', label: '4K', width: 3840, height: 2160 },
  { id: 'resolution-2k', label: '2K', width: 2560, height: 1440 },
  { id: 'resolution-1080p', label: '1080P', width: 1920, height: 1080 },
  { id: 'resolution-960p', label: '960P', width: 1280, height: 960 },
  { id: 'resolution-720p', label: '720P', width: 1280, height: 720 },
  { id: 'resolution-540p', label: '540P', width: 960, height: 540 },
]

/** 默认调色板。 */
export const defaultColorPaletteCatalog: ColorPaletteCatalogItem[] = [
  {
    id: 'palette-ibot-blue',
    label: '深蓝对比',
    colors: [0x2d58ff, 0x35a8ff, 0xf8fafc],
  },
  {
    id: 'palette-silver',
    label: '银灰排行',
    colors: [0xf4f4f5, 0xd4d4d8, 0xffffff],
  },
  {
    id: 'palette-warm',
    label: '暖色提要',
    colors: [0xf59e0b, 0xf97316, 0xf8fafc],
  },
]

/** 默认背景预设。 */
export const defaultBackgroundPresetCatalog: BackgroundPresetCatalogItem[] = [
  {
    id: 'background-dark-stage',
    label: '暗色舞台',
    kind: 'solid',
    fill: 0x05070a,
  },
  {
    id: 'background-dark-panel',
    label: '深灰对比',
    kind: 'vertical-gradient',
    fill: 0x0b0f15,
    topColor: 0x0d1117,
    bottomColor: 0x05070a,
    overlayColor: 0x05070a,
    overlayAlpha: 0.18,
  },
  {
    id: 'background-cyber-warm',
    label: '暖色雾面',
    kind: 'vertical-gradient',
    fill: 0x161214,
    topColor: 0x2a1a12,
    bottomColor: 0x07090d,
    overlayColor: 0x040608,
    overlayAlpha: 0.3,
  },
]
