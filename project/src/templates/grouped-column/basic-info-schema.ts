import type { FieldGroupSchema } from '../template-types'

/** 分组竖柱模板的基础信息字段。 */
export const groupedColumnBasicInfoGroups: FieldGroupSchema[] = [
  {
    id: 'grouped-layout',
    title: '模板开关',
    fields: [
      {
        id: 'background-preset',
        label: '背景预设',
        optionsSource: 'backgroundPresetCatalog',
        path: 'chart.style.backgroundPresetId',
        type: 'select',
      },
      {
        id: 'show-legend',
        label: '显示图例',
        path: 'chart.template.showLegend',
        type: 'toggle',
      },
      {
        id: 'show-footer',
        label: '显示页脚',
        path: 'chart.template.showFooter',
        type: 'toggle',
      },
      {
        id: 'show-subtitle',
        label: '显示副标题',
        path: 'chart.template.showSubtitle',
        type: 'toggle',
      },
    ],
  },
]
