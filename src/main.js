import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './plugins/element'
import {post} from './api/https'
import { toThousands } from './api/util'

Vue.config.productionTip = false;
//定义全局变量
Vue.prototype.$post = post;
Vue.prototype.$toThousands = toThousands

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');
