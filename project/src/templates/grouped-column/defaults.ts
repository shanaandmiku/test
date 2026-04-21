import type { ProjectRecord, ProjectTextContent, ProjectTextStyle } from '../../project/project-model'
import type { CreateProjectSeed } from '../template-types'

// 创建默认文本样式。
function createTextStyle(overrides: Partial<ProjectTextStyle>): ProjectTextStyle {
  return {
    color: 0xf8fafc,
    fontFamily: 'Space Grotesk',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 28,
    wordWrap: false,
    ...overrides,
  }
}

// 创建默认文本配置。
function createTextContent(content: string, style: Partial<ProjectTextStyle>): ProjectTextContent {
  return {
    content,
    style: createTextStyle(style),
  }
}

// 创建图1风格的默认项目。
export function createGroupedColumnProject(seed: CreateProjectSeed): ProjectRecord {
  return {
    meta: {
      id: seed.id,
      name: seed.name,
      summary: seed.summary,
      templateKind: 'grouped-column',
      updatedAt: seed.updatedAt,
    },
    page: {
      frameRate: 25,
      resolutionId: 'resolution-1080p',
    },
    content: {
      eyebrow: createTextContent('硬件茶谈 bilibili', {
        fontFamily: 'IBM Plex Mono',
        fontSize: 22,
        fontWeight: '500',
        lineHeight: 24,
      }),
      footer: createTextContent('帧数大概能有接近 10% 的提升', {
        fontSize: 34,
        lineHeight: 38,
      }),
      subtitle: createTextContent(
        'Ultra7 270K Plus  分辨率：1920×1080  画质：低预设  开启APO  单位：帧/秒(越高越好)',
        {
          color: 0x7c8697,
          fontFamily: 'IBM Plex Mono',
          fontSize: 18,
          fontWeight: '500',
          lineHeight: 22,
        },
      ),
      title: createTextContent('IBOT 游戏帧数对比', {
        fontSize: 58,
        lineHeight: 60,
      }),
      unitLabel: createTextContent('单位：帧/秒', {
        color: 0x94a3b8,
        fontFamily: 'IBM Plex Mono',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 16,
      }),
    },
    chart: {
      metrics: [
        { id: 'avgFps', label: '平均帧' },
        { id: 'lowFps', label: '低帧' },
      ],
      series: [
        { id: 'ibot-on', label: '开启 IBOT 优化', color: 0x2d58ff },
        { id: 'ibot-off', label: '关闭 IBOT 优化', color: 0x35a8ff },
      ],
      style: {
        accentColor: 0x2d58ff,
        backgroundPresetId: 'background-dark-panel',
        baselineColor: 0xf8fafc,
        colorPaletteId: 'palette-ibot-blue',
        gridAlpha: 0.85,
        gridColor: 0x212834,
        labelColor: 0xf8fafc,
        panelAlpha: 1,
        panelFill: 0x0f141b,
        secondaryValueColor: 0xf1f5f9,
        trackAlpha: 0.92,
        trackColor: 0x1b2028,
        valueColor: 0xf8fafc,
      },
      template: {
        kind: 'grouped-column',
        primaryMetricId: 'avgFps',
        secondaryMetricId: 'lowFps',
        showFooter: true,
        showLegend: true,
        showSubtitle: true,
      },
    },
    data: {
      categories: [
        { id: 'shadow-of-the-tomb-raider', label: '《古墓丽影：暗影》' },
        { id: 'cyberpunk-2077', label: '《赛博朋克2077》' },
        { id: 'naraka-bladepoint', label: '《永劫无间》' },
      ],
      points: [
        {
          categoryId: 'shadow-of-the-tomb-raider',
          seriesId: 'ibot-on',
          values: {
            avgFps: 348,
            lowFps: 167,
          },
        },
        {
          categoryId: 'shadow-of-the-tomb-raider',
          seriesId: 'ibot-off',
          values: {
            avgFps: 295,
            lowFps: 156,
          },
        },
        {
          categoryId: 'cyberpunk-2077',
          seriesId: 'ibot-on',
          values: {
            avgFps: 230,
            lowFps: 167,
          },
        },
        {
          categoryId: 'cyberpunk-2077',
          seriesId: 'ibot-off',
          values: {
            avgFps: 224,
            lowFps: 167,
          },
        },
        {
          categoryId: 'naraka-bladepoint',
          seriesId: 'ibot-on',
          values: {
            avgFps: 299,
            lowFps: 131,
          },
        },
        {
          categoryId: 'naraka-bladepoint',
          seriesId: 'ibot-off',
          values: {
            avgFps: 286,
            lowFps: 140,
          },
        },
      ],
    },
  }
}
