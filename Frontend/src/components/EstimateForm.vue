<template>
  <q-page class="flex flex-center q-pa-sm bg-grey-1">
    <q-card style="width: 100%; max-width: 450px;" flat bordered class="shadow-3">
      <q-card-section class="q-pa-md">
        <div class="text-h6 text-center q-mb-sm text-primary text-weight-bolder">
          PC 조립 견적 요청
        </div>
        
        <div v-if="userStore.isLoggedIn" class="q-mb-md q-pa-sm bg-blue-1 rounded-borders row items-center">
          <q-icon name="info" color="primary" size="xs" class="q-mr-xs" />
          <span class="text-caption text-primary text-weight-bold">회원 정보로 자동 입력되었습니다.</span>
        </div>

        <q-form @submit="handleOrder" class="q-gutter-y-md">
          <q-input 
            v-model="form.customer_name" 
            label="성함 *" 
            outlined 
            dense 
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
            placeholder="성함을 입력해주세요"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="grey-6" />
            </template>
          </q-input>
          
          <q-input 
            v-model="form.contact" 
            label="연락처 *" 
            mask="###-####-####" 
            outlined 
            dense 
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
            placeholder="010-0000-0000"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="grey-6" />
            </template>
          </q-input>
          
          <q-select 
            v-model="form.usage" 
            :options="['사무용', '게임용', '영상/그래픽 작업', '서버용', '기타']" 
            label="사용 용도 *" 
            outlined 
            dense 
          />

          <q-input 
            v-model.number="form.budget" 
            type="number" 
            label="희망 예산 (단위: 만원) *" 
            outlined 
            dense 
            suffix="만원"
          />

          <q-input
            v-model="form.description"
            type="textarea"
            label="추가 요청사항"
            placeholder="선호하는 부품이나 하시는 게임을 적어주세요."
            maxlength="200"
            counter 
            outlined 
            dense
            rows="3" 
          />

          <div class="q-pa-sm bg-grey-2 rounded-borders">
            <q-checkbox 
              v-model="isAgreed" 
              label="개인정보 수집 및 이용 동의 (필수)" 
              color="primary"
              dense
            />
          </div>

          <q-btn 
            label="견적 신청하기" 
            type="submit" 
            color="primary" 
            class="full-width q-mt-md"
            size="lg"
            :loading="store.loading" 
            :disable="!isAgreed"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useEstimateStore } from '../stores/estimate';
import { useUserStore } from '../stores/user';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const store = useEstimateStore();
const userStore = useUserStore();

const isAgreed = ref(false);

const form = ref({
  user_id: null,
  customer_name: '',
  contact: '',
  usage: '',
  budget: null,
  description: ''
});

// 페이지가 마운트될 때 Pinia 데이터를 form에 즉시 바인딩
onMounted(() => {
  if (userStore.isLoggedIn && userStore.user) {
    // form.value의 각 항목에 값을 할당하면 화면(v-model)에 즉시 보입니다.
    form.value.user_id = userStore.user.id;
    form.value.customer_name = userStore.user.name || '';
    form.value.contact = userStore.user.phone || '';
  }
});

const handleOrder = async () => {
  if (!form.value.customer_name || !form.value.contact || !form.value.budget) {
    $q.notify({ color: 'warning', message: '필수 정보를 입력해주세요.', position: 'top' });
    return;
  }

  const submitData = {
    ...form.value,
    privacy_agreed: 'Y',
    user_id: userStore.isLoggedIn ? userStore.user.id : null 
  };

  const success = await store.submitEstimate(submitData);
  
  if (success) {
    $q.dialog({
      title: '접수 완료',
      message: '성공적으로 접수되었습니다.',
      ok: { color: 'primary' }
    }).onOk(() => {
      // 폼 초기화 (user_id 등은 유지)
      form.value.usage = '';
      form.value.budget = null;
      form.value.description = '';
      isAgreed.value = false;
    });
  }
};
</script>

<style scoped>
/* 입력 필드가 채워졌을 때 아주 연한 파란색으로 강조 */
.bg-blue-0 {
  background-color: #f0f7ff !important;
}
</style>