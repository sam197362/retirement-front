import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 設定 Axios 後端 API 基礎網址
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || ''

// Import Bootstrap CSS & JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Import Custom Styles
import './assets/styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
