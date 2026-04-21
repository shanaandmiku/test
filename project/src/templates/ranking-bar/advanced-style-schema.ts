import type { FieldGroupSchema } from '../template-types'

/** 横向排行模板的高级样式字段。 */
export const rankingBarAdvancedStyleGroups: FieldGroupSchema[] = [
  {
    id: 'ranking-colors',
    title: '图表样式',
    fields: [
      {
        id: 'panel-fill',
        label: '面板底色',
        path: 'chart.style.panelFill',
        type: 'color',
      },
      {
        id: 'panel-alpha',
        label: '面板透明度',
        max: 1,
        min: 0,
        path: 'chart.style.panelAlpha',
        step: 0.05,
        type: 'number',
      },
      {
        id: 'grid-color',
        label: '坐标线颜色',
        path: 'chart.style.gridColor',
        type: 'color',
      },
      {
        id: 'grid-alpha',
        label: '坐标线透明度',
        max: 1,
        min: 0,
        path: 'chart.style.gridAlpha',
        step: 0.05,
        type: 'number',
      },
      {
        id: 'value-color',
        label: '主数值颜色',
        path: 'chart.style.valueColor',
        type: 'color',
      },
      {
        id: 'secondary-value-color',
        label: '次数值颜色',
        path: 'chart.style.secondaryValueColor',
        type: 'color',
      },
    ],
  },
]
