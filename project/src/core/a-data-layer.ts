import { z } from 'zod'
import { testRuntimeConfig } from '../config/runtime-config.ts'
import { getTemplateById } from '../template'
import type { AnyTemplateDefinition } from '../template/template-definition.ts'
import type { Json2VideoRuntimeConfig } from '../type/type-a-b.ts'
import type { ProjectSource } from '../type/type-a-z.ts'

// 数据层最终输出
export type DataLayerResult = {
  config: Json2VideoRuntimeConfig
  dataSource: unknown
  template: AnyTemplateDefinition
}

const projectSourceSchema = z.object({
  configId: z.string(),
  dataSource: z.unknown(),
  templateId: z.string(),
})

const runtimeConfigMap: Record<string, Json2VideoRuntimeConfig> = {
  'default-runtime-config': testRuntimeConfig,
}

const getRuntimeConfigById = (configId: string): Json2VideoRuntimeConfig => {
  const runtimeConfig = runtimeConfigMap[configId]

  if (!runtimeConfig) {
    throw new Error(`未找到运行配置: ${configId}`)
  }

  return runtimeConfig
}

// 根据项目输入解析运行时所需的数据、模板和配置
export const normalizeData = (projectSourceInput: unknown): DataLayerResult => {
  const projectSource = projectSourceSchema.parse(
    projectSourceInput,
  ) as ProjectSource

  return {
    config: getRuntimeConfigById(projectSource.configId),
    dataSource: projectSource.dataSource,
    template: getTemplateById(projectSource.templateId),
  }
}
