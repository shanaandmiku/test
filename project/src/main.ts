import '@fontsource/space-grotesk/latin-400.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import './style.css'
import App from './app.vue'

const app = createApp(App)

app.use(createPinia())
app.mount('#app')
