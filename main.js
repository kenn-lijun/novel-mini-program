
// #ifndef VUE3
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
Vue.prototype.$baseUrl = "https://www.kenn.plus:8082"
// Vue.prototype.$baseUrl = "https://ipv4.lijun.website:18082"

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