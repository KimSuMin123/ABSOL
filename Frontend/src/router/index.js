import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createWebHistory(import.meta.env.BASE_URL || '/') 
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  let user = {};
  try {
    user = userData ? JSON.parse(userData) : {};
  } catch (e) {
    user = {};
  }
  
  const isAuthenticated = !!token;
  // [체크] user.login_id가 정확히 'admin'인지 확인 (대소문자 주의)
  const isAdmin = user && user.login_id === 'admin';
  const isAdminPage = to.path.startsWith('/admin');

  // 디버깅용 로그 (나중에 지우세요)
  console.log('현재 유저 ID:', user?.login_id);
  console.log('관리자 여부:', isAdmin);

  if (isAdminPage) {
    if (!isAuthenticated) {
      next('/login');
    } else if (!isAdmin) {
      alert('관리자 권한이 없습니다.');
      next('/');
    } else {
      next(); // 드디어 통과!
    }
  } else if (to.path === '/login' && isAuthenticated) {
    isAdmin ? next('/admin/orders') : next('/');
  } else {
    next();
  }
});
export default router;