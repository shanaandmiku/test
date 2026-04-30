import { z } from 'zod'
import { type Json2VideoRuntimeConfig } from '../type/type-a-b.ts'
import { readFile } from '../utils/file-util.ts'
import type {
  TemplatePluginContext,
  TemplatePluginResult,
} from 'template/src/type.ts'
import * as shared from '@chartclip/shared'

export const DataSourceSchema = z
  .object({
    projectId: z.number(),
    templateName: z.string(),
  })
  .catchall(z.unknown())

type DataSourceType = z.infer<typeof DataSourceSchema>

export type DataLayerResult = {
  config: Json2VideoRuntimeConfig
  dataSource: DataSourceType
  template: TemplatePluginResult
}

export interface IOrigInfo {
  runtimeConfig: Json2VideoRuntimeConfig
  projectId: string
}

export const normalizeData = async (
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

  const dataSource = DataSourceSchema.parse(project)

  const { templateName } = dataSource
  const templateText = await readFile(workspaceRef, ['template'], templateName)

  const blob = new Blob([templateText], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)

  let template: TemplatePluginResult | null = null
  try {
    const mod = await import(url)
    const createPlugin = mod.default
    if (typeof createPlugin === 'function') {
      const createPluginContext: TemplatePluginContext = {
        shared: shared,
      }
      template = createPlugin(createPluginContext)
    }
  } finally {
    URL.revokeObjectURL(url)
  }
  if (!template) {
    throw new Error(`未找到模板: ${templateName}`)
  }

  const rtn: DataLayerResult = {
    config: runtimeConfig,
    dataSource: dataSource,
    template,
  }

  return rtn
}
