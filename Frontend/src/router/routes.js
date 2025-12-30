const routes = [
  // 일반 사용자 레이아웃
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '/estimate', component: () => import('../components/EstimateForm.vue') },
      { path: '', component: () => import('../components/RepairForm.vue') },
      { path: '/register', component: () => import('../pages/RegisterPage.vue') },
       { path: '/order', component: () => import('../pages/ProductList.vue') },
    ]
  },

  // 관리자 전용 레이아웃
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: 'estimates', component: () => import('../pages/admin/EstimateManagement.vue') },
      { path: 'repairs', component: () => import('../pages/admin/RepairManagement.vue') },
      { path: 'products', component: () => import('../pages/admin/ProductManagement.vue') },
      { path: 'users', component: () => import('../pages/admin/UserManagement.vue') },
    ]
  }
];

export default routes;