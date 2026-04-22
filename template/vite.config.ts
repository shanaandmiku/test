import { defineConfig } from 'vite'
import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

// 模板源码所在的目录片段，后面要加层级时只改这里。
const templateSourceDirectorySegments = ['base']
const templateEntryNamePrefix = templateSourceDirectorySegments.join('-')

// 扫描 src/base 下的模板目录，自动生成库模式入口。
function createTemplateEntries() {
  const baseDirectory = resolve(
    import.meta.dirname,
    'src',
    ...templateSourceDirectorySegments,
  )
  const directoryNames = readdirSync(baseDirectory).filter((name) => {
    const targetPath = resolve(baseDirectory, name)
    return statSync(targetPath).isDirectory()
  })

  return Object.fromEntries(
    directoryNames.map((name) => [
      `${templateEntryNamePrefix}-${name}`,
      resolve(baseDirectory, name, 'index.ts'),
    ]),
  )
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: createTemplateEntries(),
      name: 'test',
    },
    rolldownOptions: {
      // 确保外部化处理那些
      // 你不想打包进库的依赖
      external: [],
      output: {
        cleanDir: true,
        dir: resolve(import.meta.dirname, '../workdirectory/template'),
      },
    },
    watch: {
      // https://rolldown.rs/reference/InputOptions.watch
    },
  },
})
