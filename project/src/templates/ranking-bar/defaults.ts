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

// 创建图2风格的默认项目。
export function createRankingBarProject(seed: CreateProjectSeed): ProjectRecord {
  return {
    meta: {
      id: seed.id,
      name: seed.name,
      summary: seed.summary,
      templateKind: 'ranking-bar',
      updatedAt: seed.updatedAt,
    },
    page: {
      frameRate: 25,
      resolutionId: 'resolution-1080p',
    },
    content: {
      badge: createTextContent('Mac 图形对比', {
        color: 0x7dd3fc,
        fontFamily: 'IBM Plex Mono',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 18,
      }),
      subtitle: createTextContent('1920 × 1200 低画质', {
        color: 0xe5e7eb,
        fontFamily: 'IBM Plex Mono',
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 22,
      }),
      title: createTextContent('《赛博朋克2077》 (fps)', {
        fontSize: 58,
        lineHeight: 62,
      }),
      unitLabel: createTextContent('0      20%      40%      60%      80%      100%', {
        color: 0xd1d5db,
        fontFamily: 'IBM Plex Mono',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 16,
      }),
    },
    chart: {
      metrics: [
        { id: 'avgFps', label: '平均帧' },
        { id: 'low1PercentFps', label: '1%低帧' },
      ],
      series: [],
      style: {
        accentColor: 0xffffff,
        backgroundPresetId: 'background-cyber-warm',
        baselineColor: 0xf4f4f5,
        colorPaletteId: 'palette-silver',
        gridAlpha: 0.3,
        gridColor: 0xffffff,
        labelColor: 0xf5f5f5,
        panelAlpha: 0.12,
        panelFill: 0x101418,
        secondaryValueColor: 0x101418,
        trackAlpha: 0.75,
        trackColor: 0xa1a1aa,
        valueColor: 0x101418,
      },
      template: {
        kind: 'ranking-bar',
        primaryMetricId: 'avgFps',
        scaleMode: 'percent-of-max',
        secondaryMetricId: 'low1PercentFps',
        showCategorySubLabel: true,
        showSubtitle: true,
      },
    },
    data: {
      categories: [
        { id: 'm5-pro-14', label: 'M5', subLabel: 'MacBook Pro 14"' },
        { id: 'm5-air-13', label: 'M5', subLabel: 'MacBook Air 13"' },
        { id: 'm4-air-13', label: 'M4', subLabel: 'MacBook Air 13"' },
        { id: 'm3-air-13', label: 'M3', subLabel: 'MacBook Air 13"' },
        { id: 'm2-air-13', label: 'M2', subLabel: 'MacBook Air 13"' },
        { id: 'm1-air-13', label: 'M1', subLabel: 'MacBook Air 13"' },
      ],
      points: [
        { categoryId: 'm5-pro-14', values: { avgFps: 51, low1PercentFps: 41 } },
        { categoryId: 'm5-air-13', values: { avgFps: 36, low1PercentFps: 30 } },
        { categoryId: 'm4-air-13', values: { avgFps: 27, low1PercentFps: 22 } },
        { categoryId: 'm3-air-13', values: { avgFps: 25, low1PercentFps: 20 } },
        { categoryId: 'm2-air-13', values: { avgFps: 22, low1PercentFps: 18 } },
        { categoryId: 'm1-air-13', values: { avgFps: 17, low1PercentFps: 13 } },
      ],
    },
  }
}
