// A 层和 B 层共享的运行时配置类型
export type Json2VideoViewport = {
  width: number
  height: number
}

// A 层和 B 层共享的运行配置
export type Json2VideoRuntimeConfig = {
  background: number
  viewport: Json2VideoViewport
}
