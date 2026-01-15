<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="isLoggedIn" elevated class="bg-grey-10">
      <q-toolbar>
        <q-btn flat dense round icon="menu" class="lt-md" @click="toggleLeftDrawer" />
        <q-btn flat no-caps no-wrap to="/order" class="q-px-sm">
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
            <template v-if="isLoggedIn">
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

    <q-drawer v-if="isLoggedIn" v-model="leftDrawerOpen" side="left" bordered overlay behavior="mobile" class="bg-grey-1">
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item class="text-weight-bold text-h5">
            <span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>TECH
          </q-item>
          <q-item clickable v-ripple to="/repairs" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="build" /></q-item-section>
            <q-item-section>수리문의</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/estimate" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="calculate" /></q-item-section>
            <q-item-section>조립견적</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/order" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="shopping_bag" /></q-item-section>
            <q-item-section>상품구매</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/cart" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="shopping_cart" /></q-item-section>
            <q-item-section>장바구니</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/chat" @click="leftDrawerOpen = false">
            <q-item-section avatar><q-icon name="smart_toy" /></q-item-section>
            <q-item-section>챗봇상담</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="isLoggedIn" class="bg-grey-9 q-pa-md">
      <div class="text-center">
        <div class="text-weight-bold"><span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>TECH</div>
        <div class="text-caption text-grey-5">대표자: 이용관 | TEL: 010-9857-7531</div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';

const router = useRouter();
const $q = useQuasar();
const userStore = useUserStore();

const leftDrawerOpen = ref(false);

// [핵심] 스토어의 isLoggedIn 변화를 실시간으로 감시합니다.
const isLoggedIn = computed(() => userStore.isLoggedIn);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleLogout = () => {
  $q.dialog({
    title: '로그아웃',
    message: '정말 로그아웃 하시겠습니까?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    userStore.logout();
    // 로그아웃 시에도 새로고침 효과를 주려면 window.location.href 사용
    window.location.href = '/';
  });
};
</script>