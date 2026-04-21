import { Application } from 'pixi.js'

import type { ProjectRecord } from '../project/project-model'
import type { BackgroundPresetCatalogItem } from '../project/resource-catalogs'
import type { ProjectResolutionOption } from '../project/project-types'
import { createGroupedColumnRenderer } from './grouped-column-renderer'
import { createRankingBarRenderer } from './ranking-bar-renderer'
import { getViewportSize, type PreviewViewport } from './shared/pixi-graphics'
import type { PreviewAnimationHandle, PreviewProjectSnapshot, PreviewTemplateScene } from './shared/pixi-scene'

export interface PreviewRendererConfig {
  backgroundPreset: BackgroundPresetCatalogItem
  devicePixelRatio?: number
  project: ProjectRecord
  resolution: ProjectResolutionOption
}

export interface PreviewRenderer {
  destroy: () => void
  getViewportSize: (frameWidth: number, frameHeight: number) => PreviewViewport
  pause: () => void
  play: () => void
  replay: () => void
  updateProject: (
    project: ProjectRecord,
    resolution: ProjectResolutionOption,
    backgroundPreset: BackgroundPresetCatalogItem,
  ) => void
}

// 创建预览渲染器并挂载到指定容器。
export const createPreviewRenderer = async (
  config: PreviewRendererConfig,
  host: HTMLElement,
): Promise<PreviewRenderer> => {
  const pixiApp = new Application()
  let currentProject = config.project
  let currentResolution = config.resolution
  let currentBackgroundPreset = config.backgroundPreset
  let timeline: PreviewAnimationHandle | null = null
  let scene: PreviewTemplateScene | null = null

  await pixiApp.init({
    antialias: true,
    autoDensity: true,
    backgroundAlpha: 0,
    width: currentResolution.width,
    height: currentResolution.height,
    resolution: Math.min(config.devicePixelRatio ?? window.devicePixelRatio ?? 1, 2),
  })

  host.appendChild(pixiApp.canvas)
  scene = createScene(pixiApp, {
    backgroundPreset: currentBackgroundPreset,
    project: currentProject,
  })

  // 按当前项目配置重建一次预览。
  const replay = () => {
    if (!scene) {
      return
    }

    pixiApp.renderer.resize(currentResolution.width, currentResolution.height)
    scene.applyProject({
      backgroundPreset: currentBackgroundPreset,
      project: currentProject,
    })
    scene.layout(currentResolution.width, currentResolution.height)
    timeline?.kill()
    timeline = scene.animate()
  }

  replay()

  return {
    destroy: () => {
      timeline?.kill()
      scene?.destroy()
      pixiApp.destroy({ removeView: true }, true)
      timeline = null
      scene = null
    },
    getViewportSize: (frameWidth: number, frameHeight: number) =>
      getViewportSize(frameWidth, frameHeight, currentResolution),
    pause: () => {
      timeline?.pause()
    },
    play: () => {
      timeline?.resume()
    },
    replay,
    updateProject: (
      project: ProjectRecord,
      resolution: ProjectResolutionOption,
      backgroundPreset: BackgroundPresetCatalogItem,
    ) => {
      const didTemplateChange = project.meta.templateKind !== currentProject.meta.templateKind

      currentProject = project
      currentResolution = resolution
      currentBackgroundPreset = backgroundPreset

      if (didTemplateChange) {
        timeline?.kill()
        scene?.destroy()
        scene = createScene(pixiApp, {
          backgroundPreset: currentBackgroundPreset,
          project: currentProject,
        })
      }

      replay()
    },
  }
}

// 根据项目模板创建对应场景。
function createScene(
  pixiApp: Application,
  snapshot: PreviewProjectSnapshot,
): PreviewTemplateScene {
  if (snapshot.project.meta.templateKind === 'ranking-bar') {
    return createRankingBarRenderer(pixiApp, snapshot)
  }

  return createGroupedColumnRenderer(pixiApp, snapshot)
}
