import { Application, Graphics, Text } from 'pixi.js'
import type { MovieIr, RectLayerIr, TextLayerIr } from '../type/type-c-d.ts'
import type { RenderBackendConfig, RenderSession } from '../type/type-d-z.ts'

export type RenderMovieIrInput = {
  backendConfig?: RenderBackendConfig
  mountTarget: HTMLDivElement
  movie: MovieIr
}

// 将竖排文本转换成逐字换行的可渲染内容
const toRenderableText = (layer: TextLayerIr): string => {
  if (layer.direction === 'vertical') {
    return Array.from(layer.text).join('\n')
  }

  return layer.text
}

const renderTextLayer = (app: Application, layer: TextLayerIr): void => {
  const textNode = new Text({
    anchor: {
      x: layer.anchorX,
      y: layer.anchorY,
    },
    style: {
      fill: layer.fill,
      fontFamily: layer.fontFamily,
      fontSize: layer.fontSize,
      fontWeight: layer.fontWeight,
    },
    text: toRenderableText(layer),
  })

  textNode.x = layer.x
  textNode.y = layer.y
  app.stage.addChild(textNode)
}

const renderRectLayer = (app: Application, layer: RectLayerIr): void => {
  const rectNode = new Graphics()

  rectNode.rect(layer.x, layer.y, layer.width, layer.height)
  rectNode.fill({
    alpha: layer.alpha ?? 1,
    color: layer.fill,
  })

  app.stage.addChild(rectNode)
}

// 根据影片 IR 刷新 Pixi 舞台内容
const drawMovieIr = (app: Application, movieIr: MovieIr): void => {
  const firstScene = movieIr.scenes[0]

  if (!firstScene) {
    return
  }

  app.stage.removeChildren()
  app.renderer.background.color = firstScene.background

  for (const layer of firstScene.layers) {
    if (layer.type === 'text') {
      renderTextLayer(app, layer)
      continue
    }

    if (layer.type === 'rect') {
      renderRectLayer(app, layer)
    }
  }
}

// 渲染后端负责创建 Pixi 会话并渲染影片 IR
export const renderMovieIr = async ({
  backendConfig,
  mountTarget,
  movie,
}: RenderMovieIrInput): Promise<RenderSession> => {
  const firstScene = movie.scenes[0]
  const app = new Application()

  await app.init({
    antialias: backendConfig?.antialias ?? true,
    autoDensity: backendConfig?.autoDensity ?? true,
    background: firstScene?.background ?? 0x000000,
    height: firstScene?.height ?? 1,
    width: firstScene?.width ?? 1,
  })

  drawMovieIr(app, movie)
  mountTarget.appendChild(app.canvas)

  return {
    app,
    destroy: () => {
      app.destroy({ removeView: true }, true)
    },
    update: (nextMovie) => {
      drawMovieIr(app, nextMovie)
    },
  }
}
