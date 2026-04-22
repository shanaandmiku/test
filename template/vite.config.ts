import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: {
        'my-lib': resolve(import.meta.dirname, 'testtemplate1/index.ts'),
      },
      name: 'MyLib',
    },
    rolldownOptions: {
      // 确保外部化处理那些
      // 你不想打包进库的依赖
      external: [],
      output: {
        dir: resolve(import.meta.dirname, '../workdirectory/template'),
      },
    },
    watch: {
      // https://rolldown.rs/reference/InputOptions.watch
    },
  },
})
