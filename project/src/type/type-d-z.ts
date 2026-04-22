import type { Application } from 'pixi.js'

// D 层和 Z 层共享的渲染后端配置
export type RenderBackendConfig = {
  antialias?: boolean
  autoDensity?: boolean
}

// D 层和 Z 层共享的渲染会话
export type RenderSession = {
  app: Application
  destroy: () => void
  update: (movie: import('./type-c-d.ts').MovieIr) => void
}
