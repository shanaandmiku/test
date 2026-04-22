import { normalizeData } from './a-data-layer.ts'
import { compileTemplate } from './b-template-runtime-layer.ts'
import { buildMovieIr } from './c-scene-ir-layer.ts'
import { renderMovieIr } from './d-render-backend-layer.ts'
import type { RenderBackendConfig, RenderSession } from '../type/type-d-z.ts'

export type Json2VideoTestRuntime = RenderSession

export type CreateJson2VideoTestRuntimeOptions = {
  backendConfig?: RenderBackendConfig
  project: unknown
}

// 创建最小实验运行时，并挂载到页面宿主节点
export const createJson2VideoRuntime = async (
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
