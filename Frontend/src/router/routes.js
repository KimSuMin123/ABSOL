const routes = [
  // 일반 사용자 레이아웃
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
   children: [
      { path: '', component: () => import('../pages/LoginPage.vue') },
      { path: 'register', component: () => import('../pages/RegisterPage.vue') },

      { path: 'estimate', component: () => import('../components/EstimateForm.vue')},
      { path: 'repairs', component: () => import('../components/RepairForm.vue') },
      { path: 'order', component: () => import('../pages/ProductList.vue'), meta: { requiresAuth: true } },
      { path: 'product/:id', component: () => import('../pages/ProductDetail.vue'), name: 'product-detail', meta: { requiresAuth: true } },
      { path: 'cart', component: () => import('../pages/CartPage.vue'), meta: { requiresAuth: true } },
      { path: 'mypage', component: () => import('../pages/MyPage.vue'), meta: { requiresAuth: true } }
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
      { path: 'product', component: () => import('../pages/admin/ProductManagement.vue') },
      { path: 'users', component: () => import('../pages/admin/UserManagement.vue') },
      { path: 'orders', component: () => import('../pages/admin/OrderManagement.vue')}
       ,{ path: 'mypc', component: () => import('../pages/admin/AdminMyPCRegister.vue')},{ 
        path: 'banner', 
        component: () => import('../pages/admin/BannerManagement.vue') 
      },{ path: '', component: () => import('../pages/admin/AdminDashboard.vue')}
    ]
  }
];

export default routes;