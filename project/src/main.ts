import '@fontsource/space-grotesk/latin-400.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import './style.css'
import App from './app.vue'

//浏览器功能校验
if (
  !('showDirectoryPicker' in window) ||
  typeof window.showDirectoryPicker !== 'function'
) {
  alert('浏览器版本不支持')
  throw new Error('浏览器版本不支持 showDirectoryPicker')
}

const app = createApp(App)

app.use(createPinia())
app.mount('#app')
