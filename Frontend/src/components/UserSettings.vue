<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-card flat bordered class="bg-white shadow-1 full-height">
        <q-card-section class="text-h6 text-weight-bold">
          <q-icon name="manage_accounts" color="primary" class="q-mr-sm" />
          내 정보 수정
        </q-card-section>
        
        <q-card-section class="q-gutter-y-sm">
          <q-input v-model="userStore.user.login_id" label="회원번호(ID)" filled readonly />
          <q-input v-model="editForm.name" label="성함" outlined filled readonly />
          <q-input v-model="editForm.phone" label="연락처" mask="###-####-####" outlined dense />
          <q-input v-model="editForm.address" label="주소" outlined dense type="textarea" rows="2" />
          
          <q-btn 
            label="수정 내용 저장" 
            color="primary" 
            class="full-width q-mt-md" 
            unelevated 
            :loading="loading"
            @click="updateProfile" 
          />
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-md-6">
      <q-card flat bordered class="bg-white shadow-1 full-height">
        <q-card-section class="text-h6 text-weight-bold text-primary">
          <q-icon name="workspace_premium" class="q-mr-sm" />
          멤버십 플랜 업그레이드
        </q-card-section>

        <div class="q-px-md q-pb-sm">
          <q-banner dense class="bg-blue-1 text-primary rounded-borders">
            <template v-slot:avatar><q-icon name="info" /></template>
            <div class="text-caption">상위 등급은 이전 등급의 모든 혜택을 포함합니다.</div>
          </q-banner>
        </div>

        <q-list separator>
          <q-item 
            v-for="plan in planOptions" 
            :key="plan.name" 
            clickable 
            v-ripple 
            @click="upgradePlan(plan)" 
            :active="userStore.user.level === plan.name" 
            :active-class="`bg-${plan.color}-1`"
            :style="userStore.user.level === plan.name ? `border-left: 5px solid var(--q-${plan.color})` : ''"
          >
            <q-item-section avatar>
              <q-icon name="stars" :color="plan.color" size="md" />
            </q-item-section>
            
            <q-item-section>
              <q-item-label class="text-weight-bold" :class="`text-${plan.color}`">
                {{ plan.name }}
              </q-item-label>
              <q-item-label caption>{{ plan.desc }}</q-item-label>
            </q-item-section>
            
            <q-item-section side>
              <q-badge v-if="userStore.user.level === plan.name" :color="plan.color">현재 등급</q-badge>
              <div v-else class="text-subtitle1 text-weight-bolder" :class="`text-${plan.color}`">
                {{ plan.price === 0 ? '무료' : plan.price.toLocaleString() + '원' }}
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../stores/user';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const $q = useQuasar();
const loading = ref(false);
const router = useRouter();
// 초기값 설정 (스토어 데이터 복제)
const editForm = ref({
  name: userStore.user.name,
  phone: userStore.user.phone,
  address: userStore.user.address
});

// 멤버십 옵션 데이터 (색상 포함)
const planOptions = [
  { name: 'Basic', desc: '일반고객', price: 0, color: 'grey-7' },
  { name: 'Standard', desc: '1년 부품 무상 보증', price: 33000, color: 'blue-7' },
  { name: 'Green', desc: '관리상품 (구리스, 청소)', price: 55000, color: 'green-7' },
  { name: 'Silver', desc: '출장비 및 점검비 무료', price: 110000, color: 'grey-5' },
  { name: 'Gold', desc: 'HDD 데이터 무료 복구', price: 165000, color: 'amber-9' },
];

// 1. 프로필 수정 로직 (성함, 연락처, 주소 업데이트)
const updateProfile = async () => {
  if (!editForm.value.name || !editForm.value.phone) {
    $q.notify({ color: 'warning', message: '성함과 연락처를 입력해주세요.' });
    return;
  }

  loading.value = true;
  try {
    // 백엔드 라우터 주소와 맞춰 PATCH 호출 (ID는 URL 파라미터로 전달)
    const res = await axios.patch(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/users/${userStore.user.id}`, {
      name: editForm.value.name,
      phone: editForm.value.phone,
      address: editForm.value.address
    });
    
    if (res.data.success) {
      // Pinia 스토어에 즉시 반영하여 UI 일관성 유지
      userStore.user.name = editForm.value.name;
      userStore.user.phone = editForm.value.phone;
      userStore.user.address = editForm.value.address;
      
      $q.notify({ 
        color: 'positive', 
        message: '개인정보가 성공적으로 수정되었습니다.', 
        icon: 'check',
        timeout: 1000 
      });
    }
  } catch (e) {
    console.error('Profile Update Error:', e);
    $q.notify({ color: 'negative', message: '정보 수정에 실패했습니다.' });
  } finally {
    loading.value = false;
  }
};
// 2. 멤버십 업그레이드 로직 (PATCH 사용 및 동적 색상 적용)
const upgradePlan = (plan) => {
  if (userStore.user.level === plan.name) {
    $q.notify({ message: '이미 이용 중인 멤버십입니다.', color: 'info' });
    return;
  }

  // 결제 전 최종 확인 다이얼로그
  $q.dialog({
    title: `<span class="text-${plan.color} text-weight-bolder">${plan.name} 멤버십 결제</span>`,
    message: `
      <div class="q-py-sm">
        <div class="text-subtitle2">신청 등급: ${plan.name}</div>
        <div class="text-subtitle2">결제 금액: <b>${plan.price.toLocaleString()}원</b></div>
        <div class="text-caption text-grey-7 q-mt-sm">* 멤버십 혜택은 결제 완료 즉시 적용됩니다.</div>
      </div>
    `,
    html: true,
    cancel: true,
    ok: { label: '결제하기', color: plan.color, unelevated: true }
  }).onOk(() => {
    // 결제 페이지(Pay.vue)로 이동하면서 멤버십 정보 전달
    router.push({
      path: '/pay',
      query: {
        mode: 'membership',
        level: plan.name,
        price: plan.price
      }
    });
  });
};
</script>

<style scoped>
.full-height {
  height: 100%;
}
.rounded-borders {
  border-radius: 8px;
}
/* 폰트 강조용 */
.text-weight-bolder {
  font-weight: 800;
}
</style>