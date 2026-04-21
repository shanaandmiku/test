- `src/app.vue`
  应用主界面壳层，负责搭建左侧项目列表、中间预览区、右侧配置区三栏布局，并处理左右分隔线拖拽缩放。

- `src/main.ts`
  Vue 应用入口，负责加载全局字体、全局样式，并挂载根组件 `app.vue`。

- `src/style.css`
  全局样式文件，只承担 CSS 变量、基础排版和 reset，避免把业务样式散落到全局。

- `src/assets/vite.svg`
  Vite 初始化模板自带的静态图标素材，当前业务代码未使用。

- `src/assets/vue.svg`
  Vue 初始化模板自带的静态图标素材，当前业务代码未使用。

- `src/components/preview-canvas.vue`
  中间预览区组件，负责创建渲染器实例、监听当前项目配置变化、监听容器尺寸变化，并把 Pixi 画布挂载到页面中。

- `src/components/project-config-panel.vue`
  右侧配置面板组件，负责展示当前项目名称、当前分辨率、帧率和可用分辨率列表。

- `src/components/project-list-panel.vue`
  左侧项目列表面板组件，负责展示项目卡片列表和当前选中状态。

- `src/project/current-project.ts`
  当前项目的数据模型与默认数据源，定义图表数据、页面配置、文本配置和分辨率选项，并导出当前项目的 `ref` 状态。

- `src/project/project-list.ts`
  左侧项目列表的数据模型与默认列表数据，负责提供项目卡片列表和当前选中项目标识。

- `src/rander/core.ts`
  Pixi 渲染核心模块，对外暴露预览渲染器创建方法，内部负责场景搭建、文本样式应用、柱状图绘制、GSAP 动画和预览尺寸计算。
