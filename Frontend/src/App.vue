<script setup>
import { onMounted } from 'vue';
import { useUserStore } from './stores/user';

const userStore = useUserStore();

onMounted(async () => {
  // 스토어에 토큰이 있다면 fetchUserInfo 액션을 실행합니다.
  if (userStore.token) {
    try {
      await userStore.fetchUserInfo();
      console.log("유저 정보 동기화 완료:", userStore.user);
    } catch (e) {
      console.error("초기 로딩 에러:", e);
    }
  }
});
</script>

<template>
  <router-view />
</template>

<style>
/* 전역 스타일에서 테이블 간섭 방지 */
.q-table td {
  white-space: nowrap; /* 텍스트가 멋대로 줄바꿈되어 밀리는 것 방지 */
}
</style>