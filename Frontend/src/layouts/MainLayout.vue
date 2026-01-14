<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="userStore.isLoggedIn" elevated class="bg-grey-10">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="lt-md"
          @click="toggleLeftDrawer"
        />

        <q-btn flat no-caps no-wrap to="/" class="q-px-sm">
          <q-toolbar-title class="text-weight-bold">
            <span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>
            <span class="text-subtitle2 q-ml-xs text-grey-5 text-weight-light">TECH</span>
          </q-toolbar-title>
        </q-btn>

        <q-space />

        <div class="gt-sm row no-wrap items-center q-gutter-x-sm">
          <q-btn flat label="수리문의" to="/repairs" />
          <q-btn flat label="조립견적" to="/estimate" />
          <q-btn flat label="상품구매" to="/order" />
          <q-btn flat label="장바구니" to="/cart" />
          <q-btn flat label="챗봇상담" to="/chat" />
          <q-separator dark vertical inset class="q-mx-sm" />
        </div>

        <q-btn-dropdown flat round dense icon="account_circle">
          <q-list style="min-width: 150px">
            <template v-if="!userStore.isLoggedIn">
              <q-item clickable v-close-popup to="/login">
                <q-item-section avatar><q-icon name="login" /></q-item-section>
                <q-item-section>로그인</q-item-section>
              </q-item>
            </template>
            
            <template v-else>
              <q-item-label header class="text-weight-bold">{{ userStore.user?.name }}님</q-item-label>
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
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="userStore.isLoggedIn"
      v-model="leftDrawerOpen"
      side="left"
      bordered
      overlay
      behavior="mobile"
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item class="text-weight-bold text-h5">
            <span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>
            <span class="text-subtitle2 q-ml-xs q-mt-sm text-grey-5 text-weight-light">TECH</span>
          </q-item>
          <q-item clickable v-ripple to="/repairs">
            <q-item-section avatar><q-icon name="build" /></q-item-section>
            <q-item-section>수리문의</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/estimate">
            <q-item-section avatar><q-icon name="calculate" /></q-item-section>
            <q-item-section>조립견적</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/order">
            <q-item-section avatar><q-icon name="shopping_bag" /></q-item-section>
            <q-item-section>상품구매</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/cart">
            <q-item-section avatar><q-icon name="shopping_cart" /></q-item-section>
            <q-item-section>장바구니</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/chat">
            <q-item-section avatar><q-icon name="smart_toy" /></q-item-section>
            <q-item-section>챗봇상담</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="userStore.isLoggedIn" class="bg-grey-9 q-pa-md">
      <div class="text-center">
        <div class="text-weight-bold">
          <span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>TECH
        </div>
        <div class="text-caption text-grey-5 q-mt-xs">
          대표자: 이용관 | 사업자번호: 000-00-00000 | TEL: 010-9857-7531
        </div>
        <div class="text-caption text-grey-5">이메일 주소: contact@absoltech.com</div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user'; // Pinia 스토어 경로 확인

const router = useRouter();
const $q = useQuasar();
const userStore = useUserStore();

// Drawer 열림/닫힘 상태 관리
const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

// 로그아웃 처리
const handleLogout = () => {
  $q.dialog({
    title: '로그아웃',
    message: '정말 로그아웃 하시겠습니까?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    // 1. 스토어의 로그아웃 액션 실행 (상태 초기화 + 로컬스토리지 삭제)
    userStore.logout();
    
    // 2. 로그인 페이지로 이동
    router.push('/login');
    
    // 3. 알림 표시
    $q.notify({
      color: 'info',
      message: '로그아웃 되었습니다.',
      icon: 'logout'
    });
  });
};
</script>