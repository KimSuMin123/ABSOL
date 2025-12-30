<template>
  <q-page class="flex flex-center q-pa-sm">
    <q-card style="width: 100%; max-width: 450px;" flat bordered>
      <q-card-section class="q-pa-md">
        <div class="text-h6 text-center q-mb-sm">PC 조립 견적 요청</div>
        
        <q-form @submit="handleOrder" class="q-gutter-y-xs"> <q-input v-model="form.customer_name" label="성함" outlined dense />
          
          <q-input v-model="form.contact" label="연락처" mask="###-####-####" outlined dense />
          
          <q-select 
            v-model="form.usage" 
            :options="['사무용', '게임용', '기타 고사양 작업']" 
            label="사용 용도" outlined dense 
          />

          <q-input 
            v-model.number="form.budget" 
            type="number" 
            label="예산 (만원)" outlined dense 
          />

          <q-input
            v-model="form.description"
            type="textarea"
            label="요청사항 (최대 200자)"
            maxlength="200"
            counter outlined dense
            rows="3" 
          />

          <div class="q-pa-sm bg-grey-1 rounded-borders border-grey-4 q-mt-sm">
            <q-checkbox 
              v-model="isAgreed" 
              label="개인정보 수집 및 이용 동의 (필수)" 
              color="primary"
              dense
            />
            <div class="text-caption text-grey-7 q-ml-md" style="font-size: 0.75rem;">
              * 원활한 견적 상담을 위해 고객 정보를 수집합니다.
            </div>
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
import { ref } from 'vue';
import { useEstimateStore } from '../stores/estimate';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const store = useEstimateStore();

const isAgreed = ref(false);

const form = ref({
  customer_name: '',
  contact: '',
  usage: '',
  budget: null,
  description: ''
});

const handleOrder = async () => {
  if (!isAgreed.value) {
    $q.notify({ color: 'warning', message: '개인정보 수집에 동의해 주세요.', position: 'top' });
    return;
  }

  if (!form.value.customer_name || !form.value.contact) {
    $q.notify({ color: 'warning', message: '성함과 연락처를 입력해 주세요.', position: 'top' });
    return;
  }

  const submitData = {
    ...form.value,
    privacy_agreed: 'Y'
  };

  const success = await store.submitEstimate(submitData);
  
  if (success) {
    $q.dialog({
      title: '신청 완료',
      message: '견적 요청이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.',
      ok: { color: 'primary' }
    }).onOk(() => {
      form.value = { customer_name: '', contact: '', usage: '', budget: null, description: '' };
      isAgreed.value = false;
    });
  } else {
    $q.notify({ color: 'negative', message: '제출 실패. 서버 상태를 확인해 주세요.', position: 'top' });
  }
};
</script>