<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-grey-10">
      <q-toolbar>
        <q-btn flat no-caps no-wrap to="/" class="q-px-sm">
          <q-toolbar-title class="text-weight-bold">
            <span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>
            <span class="text-subtitle2 q-ml-xs text-grey-5 text-weight-light">TECH</span>
          
          </q-toolbar-title>
        </q-btn>

        <q-space />

        <div class="row no-wrap items-center q-gutter-x-sm">
           <q-btn flat label="수리문의" to="/" />
          <q-btn flat label="조립견적" to="/estimate" />
          <q-btn flat label="상품구매" to="/order" />
          <q-btn flat label="장바구니" to="/cart" />
          <q-separator dark vertical inset class="q-mx-sm" />

          <q-btn-dropdown flat round dense icon="account_circle">
            <q-list style="min-width: 150px">
              <template v-if="!authStore.isLoggedIn">
                <q-item clickable v-close-popup to="/login">
                  <q-item-section avatar><q-icon name="login" /></q-item-section>
                  <q-item-section>로그인</q-item-section>
                </q-item>
              </template>
              
              <template v-else>
                <q-item-label header class="text-weight-bold">{{ authStore.user?.name }}님</q-item-label>
                <q-item clickable v-close-popup to="/mypage">
                  <q-item-section avatar><q-icon name="person" /></q-item-section>
                  <q-item-section>마이페이지</q-item-section>
                </q-item>
                
                <q-item v-if="authStore.isAdmin" clickable v-close-popup to="/admin/estimates">
                  <q-item-section avatar><q-icon name="admin_panel_settings" color="orange" /></q-item-section>
                  <q-item-section class="text-orange text-weight-bold">관리자 시스템</q-item-section>
                </q-item>

                <q-separator />
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                  <q-item-section class="text-negative">로그아웃</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-9 q-pa-md">
      <div class="text-center">
        <div class="text-weight-bold"><span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>TECH</div>
        <div class="text-caption text-grey-5">대표자: 이용관 | 사업자번호: 000-00-00000 | TEL: 010-9857-7531</div>
        <div class="text-caption text-grey-5">이메일 주소: </div>
      </div>
    </q-footer>
  </q-layout>
</template>