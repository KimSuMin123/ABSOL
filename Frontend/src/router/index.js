import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

// Quasar 래퍼 함수 없이 직접 라우터 생성
const Router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  // Vite 환경에서는 process.env.VUE_ROUTER_BASE 대신 '/' 혹은 import.meta.env.BASE_URL 사용
  history: createWebHistory('/') 
})

export default Router