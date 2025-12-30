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
<script setup>
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth'; // 실제 스토어 경로에 맞게 수정

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const handleLogout = () => {
  $q.dialog({
    title: '로그아웃',
    message: '정말 로그아웃 하시겠습니까?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    // 로컬스토리지 정리 및 스토어 로그아웃 실행
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authStore.logout(); // authStore 내부에 로그아웃 로직이 있어야 함
    
    router.push('/login');
    $q.notify({
      color: 'info',
      message: '로그아웃 되었습니다.',
      icon: 'logout'
    });
  });
};
</script>