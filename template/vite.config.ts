import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: {
        testtemplate1: resolve(
          import.meta.dirname,
          'src/base/testtemplate1/index.ts',
        ),
      },
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
