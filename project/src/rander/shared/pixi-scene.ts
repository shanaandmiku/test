import type { ProjectRecord } from '../../project/project-model'
import type { BackgroundPresetCatalogItem } from '../../project/resource-catalogs'

/** 预览时间线句柄。 */
export interface PreviewAnimationHandle {
  kill: () => void
  pause: () => void
  resume: () => void
}

/** 传给模板渲染器的项目快照。 */
export interface PreviewProjectSnapshot {
  backgroundPreset: BackgroundPresetCatalogItem
  project: ProjectRecord
}

/** 模板渲染场景接口。 */
export interface PreviewTemplateScene {
  animate: () => PreviewAnimationHandle
  applyProject: (snapshot: PreviewProjectSnapshot) => void
  destroy: () => void
  layout: (width: number, height: number) => void
}
