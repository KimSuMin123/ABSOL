<template>
  <q-card flat bordered class="q-mb-md bg-white shadow-1">
    <q-card-section class="row items-center q-py-lg">
      <q-avatar size="80px" color="blue-1" text-color="primary" icon="person" class="shadow-1" />
      
      <div class="q-ml-lg">
        <div class="row items-center q-gutter-x-sm">
          <div class="text-h5 text-weight-bolder">{{ userStore.user.name }}님</div>
          <q-badge 
            :color="getPlanColor(userStore.user.level)" 
            class="q-pa-xs text-weight-bold"
          >
            {{ userStore.user.level || 'Basic' }} 멤버십
          </q-badge>
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          ID: {{ userStore.user.login_id }}
        </div>
      </div>

      <q-space />

      <div class="text-right">
        <div class="text-caption text-grey-6">가입일</div>
        <div class="text-subtitle2 text-weight-bold">
          {{ userStore.user.createdAt?.substring(0, 10) || '2025-12-30' }}
        </div>
        <q-btn 
          flat 
          dense 
          size="sm" 
          color="primary" 
          label="로그아웃" 
          icon="logout"
          class="q-mt-xs"
          @click="handleLogout"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const userStore = useUserStore();
const router = useRouter();
const $q = useQuasar();

// 멤버십 등급별 색상 매칭
const getPlanColor = (lvl) => {
  const colors = {
    'Gold': 'amber-9',
    'Silver': 'grey-5',
    'Green': 'green-7',
    'Standard': 'blue-7'
  };
  return colors[lvl] || 'grey-7';
};

// 로그아웃 처리
const handleLogout = () => {
  $q.dialog({
    title: '로그아웃',
    message: '정말 로그아웃 하시겠습니까?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    userStore.logout(); // Pinia 스토어의 로그아웃 액션 호출
    router.push('/');
    $q.notify({
      color: 'positive',
      message: '성공적으로 로그아웃 되었습니다.',
      icon: 'check'
    });
  });
};
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}
</style>