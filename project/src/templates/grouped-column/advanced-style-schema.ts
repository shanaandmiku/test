import type { FieldGroupSchema } from '../template-types'

/** 分组竖柱模板的高级样式字段。 */
export const groupedColumnAdvancedStyleGroups: FieldGroupSchema[] = [
  {
    id: 'grouped-colors',
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
        label: '网格颜色',
        path: 'chart.style.gridColor',
        type: 'color',
      },
      {
        id: 'grid-alpha',
        label: '网格透明度',
        max: 1,
        min: 0,
        path: 'chart.style.gridAlpha',
        step: 0.05,
        type: 'number',
      },
      {
        id: 'track-color',
        label: '柱体底板色',
        path: 'chart.style.trackColor',
        type: 'color',
      },
      {
        id: 'track-alpha',
        label: '柱体底板透明度',
        max: 1,
        min: 0,
        path: 'chart.style.trackAlpha',
        step: 0.05,
        type: 'number',
      },
    ],
  },
]
