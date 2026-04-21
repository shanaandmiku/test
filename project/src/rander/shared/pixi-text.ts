import { Text } from 'pixi.js'

import type { ProjectTextContent, ProjectTextStyle } from '../../project/project-model'

// 把项目里的文本样式应用到 Pixi 文本对象上。
export function applyProjectTextStyle(target: Text, textStyle: ProjectTextStyle): void {
  target.style.fill = textStyle.color
  target.style.fontFamily = textStyle.fontFamily
  target.style.fontSize = textStyle.fontSize
  target.style.fontWeight = textStyle.fontWeight
  target.style.letterSpacing = textStyle.letterSpacing
  target.style.lineHeight = textStyle.lineHeight
  target.style.wordWrap = textStyle.wordWrap ?? true
  target.style.wordWrapWidth = textStyle.maxWidth ?? 0
}

// 根据文本配置创建 Pixi 文本对象。
export function createProjectText(textConfig?: ProjectTextContent): Text {
  const text = new Text({
    text: textConfig?.content ?? '',
    style: {
      wordWrap: textConfig?.style.wordWrap ?? true,
      wordWrapWidth: textConfig?.style.maxWidth ?? 0,
    },
  })

  if (textConfig) {
    applyProjectTextStyle(text, textConfig.style)
  }

  return text
}

// 更新已有文本对象的内容和样式。
export function applyProjectText(target: Text, textConfig?: ProjectTextContent): void {
  target.text = textConfig?.content ?? ''

  if (textConfig) {
    applyProjectTextStyle(target, textConfig.style)
  }
}
