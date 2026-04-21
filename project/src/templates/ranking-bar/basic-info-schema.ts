import type { FieldGroupSchema } from '../template-types'

/** 横向排行模板的基础信息字段。 */
export const rankingBarBasicInfoGroups: FieldGroupSchema[] = [
  {
    id: 'ranking-layout',
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
        id: 'scale-mode',
        label: '坐标模式',
        options: [
          { label: '绝对值', value: 'absolute' },
          { label: '百分比', value: 'percent-of-max' },
        ],
        path: 'chart.template.scaleMode',
        type: 'select',
      },
      {
        id: 'show-category-sub-label',
        label: '显示分类副标题',
        path: 'chart.template.showCategorySubLabel',
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
