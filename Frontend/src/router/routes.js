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
      { path: 'mypage', component: () => import('../pages/MyPage.vue'), meta: { requiresAuth: true } },
       { path: 'pay', component: () => import('../components/Payment.vue'), meta: { requiresAuth: true } },
      { path: 'success', component: () => import('../components/SuccessView.vue'), meta: { requiresAuth: true } },
       { path: 'chat', component: () => import('../components/ChatBotComponent.vue'), meta: { requiresAuth: true } },
       { path: 'find-id', component: () => import('../components/FindIdPage.vue') }, 
      { path: 'find-pw', component: () => import('../components/FindPwPage.vue') },
      { path: 'membership', component: () => import('../components/MembershipChange.vue') },
      { path: 'datarepair', component: () => import('../components/DateRepairForm.vue') },
      { path: 'qna', component: () => import('../pages/QnaList.vue') },
      {path: 'qna/write',component: () => import('../pages/QnaWrite.vue')},
      {path: 'qna/:id', component: () => import('../pages/QnaDetail.vue')},
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
      },{ path: '', component: () => import('../pages/admin/AdminDashboard.vue')},
      { path: 'mypcview', component: () => import('../pages/admin/AdminUserPCList.vue')},
       { path: 'estimatesDetail', component: () => import('../pages/admin/AdminEstimateDetail.vue') },
        { path: 'datarepair', component: () => import('../pages/admin/AdminDataRepair.vue') },
          { path: 'nopay', component: () => import('../pages/admin/NoPay.vue')}
    ]
  }
];

export default routes;