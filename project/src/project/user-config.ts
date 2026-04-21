import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { isPlainObject, syncLocalStorageRef } from '../util/common'
import {
  defaultBackgroundPresetCatalog,
  defaultColorPaletteCatalog,
  defaultFontCatalog,
  defaultResolutionCatalog,
  type BackgroundPresetCatalogItem,
  type ColorPaletteCatalogItem,
  type FontCatalogItem,
} from './resource-catalogs'
import type { ProjectResolutionOption } from './project-types'

/** 全局资源中心状态。 */
export interface UserConfigState {
  backgroundPresetCatalog: BackgroundPresetCatalogItem[]
  colorPaletteCatalog: ColorPaletteCatalogItem[]
  fontCatalog: FontCatalogItem[]
  resolutionCatalog: ProjectResolutionOption[]
}

// 创建默认全局资源中心。
export function createDefaultUserConfigState(): UserConfigState {
  return {
    backgroundPresetCatalog: defaultBackgroundPresetCatalog.map((item) => ({ ...item })),
    colorPaletteCatalog: defaultColorPaletteCatalog.map((item) => ({
      ...item,
      colors: [...item.colors],
    })),
    fontCatalog: defaultFontCatalog.map((item) => ({ ...item })),
    resolutionCatalog: defaultResolutionCatalog.map((item) => ({ ...item })),
  }
}

// 全局资源中心 store。
export const useUserConfigStore = defineStore('user-config', () => {
  const state = ref<UserConfigState>(createDefaultUserConfigState())

  syncLocalStorageRef('user-config', state, {
    parse: parseUserConfig,
  })

  const backgroundPresetCatalog = computed(() =>
    state.value.backgroundPresetCatalog.length > 0
      ? state.value.backgroundPresetCatalog
      : createDefaultUserConfigState().backgroundPresetCatalog,
  )

  const colorPaletteCatalog = computed(() =>
    state.value.colorPaletteCatalog.length > 0
      ? state.value.colorPaletteCatalog
      : createDefaultUserConfigState().colorPaletteCatalog,
  )

  const fontCatalog = computed(() =>
    state.value.fontCatalog.length > 0
      ? state.value.fontCatalog
      : createDefaultUserConfigState().fontCatalog,
  )

  const resolutionCatalog = computed(() =>
    state.value.resolutionCatalog.length > 0
      ? state.value.resolutionCatalog
      : createDefaultUserConfigState().resolutionCatalog,
  )

  // 添加自定义分辨率。
  function addCustomResolution(option: ProjectResolutionOption): void {
    state.value.resolutionCatalog = [
      ...state.value.resolutionCatalog,
      option,
    ]
  }

  // 删除指定分辨率。
  function removeResolution(resolutionId: string): void {
    state.value.resolutionCatalog = state.value.resolutionCatalog.filter(
      (option) => option.id !== resolutionId,
    )
  }

  // 根据 id 查找背景预设。
  function getBackgroundPresetById(presetId: string): BackgroundPresetCatalogItem {
    return backgroundPresetCatalog.value.find((item) => item.id === presetId)
      ?? backgroundPresetCatalog.value[0]
      ?? createDefaultUserConfigState().backgroundPresetCatalog[0]
  }

  // 根据 id 查找调色板预设。
  function getColorPaletteById(paletteId: string): ColorPaletteCatalogItem {
    return colorPaletteCatalog.value.find((item) => item.id === paletteId)
      ?? colorPaletteCatalog.value[0]
      ?? createDefaultUserConfigState().colorPaletteCatalog[0]
  }

  // 根据 id 查找分辨率。
  function getResolutionById(resolutionId: string): ProjectResolutionOption {
    return resolutionCatalog.value.find((item) => item.id === resolutionId)
      ?? resolutionCatalog.value[0]
      ?? createDefaultUserConfigState().resolutionCatalog[0]
  }

  return {
    addCustomResolution,
    backgroundPresetCatalog,
    colorPaletteCatalog,
    fontCatalog,
    getBackgroundPresetById,
    getColorPaletteById,
    getResolutionById,
    removeResolution,
    resolutionCatalog,
    state,
  }
})

// 解析用户配置，只保留已声明的资源目录结构。
function parseUserConfig(rawValue: string): UserConfigState {
  const parsedValue = JSON.parse(rawValue) as unknown
  const nextState = createDefaultUserConfigState()

  if (!isPlainObject(parsedValue)) {
    return nextState
  }

  if (Array.isArray(parsedValue.backgroundPresetCatalog)) {
    const validItems = parsedValue.backgroundPresetCatalog.filter(isBackgroundPresetCatalogItem)

    if (validItems.length > 0) {
      nextState.backgroundPresetCatalog = validItems
    }
  }

  if (Array.isArray(parsedValue.colorPaletteCatalog)) {
    const validItems = parsedValue.colorPaletteCatalog.filter(isColorPaletteCatalogItem)

    if (validItems.length > 0) {
      nextState.colorPaletteCatalog = validItems
    }
  }

  if (Array.isArray(parsedValue.fontCatalog)) {
    const validItems = parsedValue.fontCatalog.filter(isFontCatalogItem)

    if (validItems.length > 0) {
      nextState.fontCatalog = validItems
    }
  }

  if (Array.isArray(parsedValue.resolutionCatalog)) {
    const validItems = parsedValue.resolutionCatalog.filter(isProjectResolutionOption)

    if (validItems.length > 0) {
      nextState.resolutionCatalog = validItems
    }
  }

  return nextState
}

// 判断分辨率选项是否合法。
function isProjectResolutionOption(value: unknown): value is ProjectResolutionOption {
  if (!isPlainObject(value)) {
    return false
  }

  return (
    typeof value.id === 'string'
    && typeof value.label === 'string'
    && typeof value.width === 'number'
    && Number.isFinite(value.width)
    && typeof value.height === 'number'
    && Number.isFinite(value.height)
  )
}

// 判断字体目录项是否合法。
function isFontCatalogItem(value: unknown): value is FontCatalogItem {
  if (!isPlainObject(value)) {
    return false
  }

  return (
    typeof value.id === 'string'
    && typeof value.label === 'string'
    && typeof value.fontFamily === 'string'
  )
}

// 判断调色板目录项是否合法。
function isColorPaletteCatalogItem(value: unknown): value is ColorPaletteCatalogItem {
  if (!isPlainObject(value) || !Array.isArray(value.colors)) {
    return false
  }

  return (
    typeof value.id === 'string'
    && typeof value.label === 'string'
    && value.colors.every((color) => typeof color === 'number' && Number.isFinite(color))
  )
}

// 判断背景预设是否合法。
function isBackgroundPresetCatalogItem(value: unknown): value is BackgroundPresetCatalogItem {
  if (!isPlainObject(value)) {
    return false
  }

  const hasValidKind = value.kind === 'solid' || value.kind === 'vertical-gradient'

  return (
    typeof value.id === 'string'
    && typeof value.label === 'string'
    && hasValidKind
    && typeof value.fill === 'number'
    && Number.isFinite(value.fill)
    && (value.topColor === undefined || typeof value.topColor === 'number')
    && (value.bottomColor === undefined || typeof value.bottomColor === 'number')
    && (value.overlayColor === undefined || typeof value.overlayColor === 'number')
    && (value.overlayAlpha === undefined || typeof value.overlayAlpha === 'number')
  )
}
