import { z } from 'zod'
import { runtimeConfig } from '../config/runtime-config.ts'
import { getTemplateById } from '../template'
import type { AnyTemplateDefinition } from '../template/template-definition.ts'
import { type Json2VideoRuntimeConfig } from '../type/type-a-b.ts'
import type { ProjectSource } from '../type/type-a-z.ts'
import { readFile } from '../utils/file-util.ts'

export const DataSourceSchema = z
  .object({
    projectId: z.number(),
    templateId: z.number(),
  })
  .catchall(z.unknown())

type DataSourceType = z.infer<typeof DataSourceSchema>

export type DataLayerResult = {
  config: Json2VideoRuntimeConfig
  dataSource: DataSourceType
  template: AnyTemplateDefinition
}

const projectSourceSchema = z.object({
  configId: z.string(),
  dataSource: z.unknown(),
  templateId: z.string(),
})

const runtimeConfigMap: Record<string, Json2VideoRuntimeConfig> = {
  'default-runtime-config': runtimeConfig,
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

export interface IOrigInfo {
  runtimeConfig: Json2VideoRuntimeConfig
  projectId: string
}
export interface IDataLayerResult {}

export const normalizeData2 = async (
  origInfo: IOrigInfo,
  workspaceRef: FileSystemDirectoryHandle,
): Promise<DataLayerResult> => {
  const { runtimeConfig, projectId } = origInfo
  //读取项目文件
  const fileText = await readFile(
    workspaceRef,
    ['project'],
    `${projectId}.json`,
  )
  const project = JSON.parse(fileText)

  const { templateName } = project
  const templateText = await readFile(workspaceRef, ['template'], templateName)
  debugger
  console.log(templateText)
  const blob = new Blob([templateText], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)

  let template = null
  try {
    const mod = await import(url)
    const createPlugin = mod.default
    if (typeof createPlugin === 'function') {
      template = createPlugin(runtimeConfig)
    }
  } finally {
    URL.revokeObjectURL(url)
  }
  if (!template) {
    throw new Error(`未找到模板: ${templateName}`)
  }

  return {
    dataSource: project,
  }

  const projectSource = projectSourceSchema.parse(origInfo) as ProjectSource

  return {
    config: getRuntimeConfigById(projectSource.configId),
    dataSource: projectSource.dataSource,
    template: getTemplateById(projectSource.templateId),
  }
}
