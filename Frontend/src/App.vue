<template>
  <router-view />
</template>

<script setup>
// 특별한 로직이 없더라도 script block은 비워두더라도 있는 것이 좋습니다.
</script>
<style>
/* 전역 스타일에서 테이블 간섭 방지 */
.q-table td {
  white-space: nowrap; /* 텍스트가 멋대로 줄바꿈되어 밀리는 것 방지 */
}
</style>