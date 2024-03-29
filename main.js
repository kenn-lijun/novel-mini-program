
// #ifndef VUE3
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
Vue.prototype.$baseUrl = "http://192.168.1.43:8092"

// main.js
import uView from '@/uni_modules/uview-ui'
Vue.use(uView)

// 引入请求封装
require('./utils/request/index')(app)

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif