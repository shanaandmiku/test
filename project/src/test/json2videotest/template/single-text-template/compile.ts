import type { Json2VideoRuntimeConfig } from '../../type/type-a-b.ts'
import type { CompiledScene, CompiledTextNode } from '../../type/type-b-c.ts'
import type {
  SimpleTextTemplateDataSource,
  SingleTextTemplateLayout,
  SimpleTextFields,
  TemplateRepeatTextGroup,
  TemplateTextSlot,
} from './types'

const findTemplateTextSlot = (
  template: SingleTextTemplateLayout,
  slotId: string,
): TemplateTextSlot | undefined => {
  return template.textSlots.find((slot) => slot.slotId === slotId)
}

const findTemplateRepeatTextGroup = (
  template: SingleTextTemplateLayout,
  groupId: string,
): TemplateRepeatTextGroup | undefined => {
  return template.repeatTextGroups.find((group) => group.groupId === groupId)
}

const createCompiledTextStyle = (item: SimpleTextFields) => {
  return {
    fill: item.fill,
    fontFamily: item.fontFamily,
    fontSize: item.fontSize,
    fontWeight: item.fontWeight,
  }
}

const createFixedTextNodes = (
  config: Json2VideoRuntimeConfig,
  dataSource: SimpleTextTemplateDataSource,
  template: SingleTextTemplateLayout,
): CompiledTextNode[] => {
  return dataSource.items.flatMap((item) => {
    const slot = findTemplateTextSlot(template, item.slotId)

    if (!slot) {
      return []
    }

    return [
      {
        type: 'text' as const,
        anchorX: slot.anchorX,
        anchorY: slot.anchorY,
        direction: 'horizontal' as const,
        style: createCompiledTextStyle(item),
        text: item.text,
        x: config.viewport.width * slot.xPercent,
        y: config.viewport.height * slot.yPercent,
      },
    ]
  })
}

const createRepeatTextNodes = (
  config: Json2VideoRuntimeConfig,
  dataSource: SimpleTextTemplateDataSource,
  template: SingleTextTemplateLayout,
): CompiledTextNode[] => {
  return dataSource.repeatItems.flatMap((item, index) => {
    const group = findTemplateRepeatTextGroup(template, item.groupId)

    if (!group) {
      return []
    }

    return [
      {
        type: 'text' as const,
        anchorX: group.anchorX,
        anchorY: group.anchorY,
        direction: group.direction,
        style: createCompiledTextStyle(item),
        text: item.text,
        x: config.viewport.width * (group.startXPercent + group.gapXPercent * index),
        y: config.viewport.height * group.yPercent,
      },
    ]
  })
}

// 将简单文本模板的数据源编译成统一场景
export const compileSingleTextTemplate = (
  config: Json2VideoRuntimeConfig,
  dataSource: SimpleTextTemplateDataSource,
  template: SingleTextTemplateLayout,
): CompiledScene => {
  return {
    background: config.background,
    height: config.viewport.height,
    nodes: [
      ...createFixedTextNodes(config, dataSource, template),
      ...createRepeatTextNodes(config, dataSource, template),
    ],
    width: config.viewport.width,
  }
}
