import { normalizeData } from './a-data-layer'
import { compileTemplate } from './b-template-runtime-layer'
import { buildMovieIr } from './c-scene-ir-layer'
import { renderMovieIr } from './d-render-backend-layer'
import type { RenderBackendConfig, RenderSession } from './type/type-d-z.ts'

export type Json2VideoTestRuntime = RenderSession

export type CreateJson2VideoTestRuntimeOptions = {
  backendConfig?: RenderBackendConfig
  project: unknown
}

// 创建最小实验运行时，并挂载到页面宿主节点
export const createJson2VideoTestRuntime = async (
  hostElement: HTMLDivElement,
  options: CreateJson2VideoTestRuntimeOptions,
): Promise<Json2VideoTestRuntime> => {
  const normalized = normalizeData(options.project)
  const compiledScene = compileTemplate({
    config: normalized.config,
    dataSource: normalized.dataSource,
    template: normalized.template,
  })
  const movie = buildMovieIr(compiledScene)

  return renderMovieIr({
    backendConfig: options.backendConfig,
    mountTarget: hostElement,
    movie,
  })
}
