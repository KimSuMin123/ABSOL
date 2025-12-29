<template>
  <q-form @submit="handleOrder" class="q-gutter-md">
    <q-input v-model="form.customer_name" label="성함" outlined dense />
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
    />

    <div class="q-pa-sm bg-grey-1 rounded-borders border-grey-4">
      <q-checkbox 
        v-model="isAgreed" 
        label="개인정보 수집 및 이용 동의 (필수)" 
        color="primary"
        keep-color
      />
      <div class="text-caption text-grey-7 q-ml-md">
        * 원활한 견적 상담을 위해 성함, 연락처 정보를 수집합니다.
      </div>
    </div>

    <q-btn 
      label="견적 신청하기" 
      type="submit" 
      color="primary" 
      class="full-width"
      :loading="store.loading" 
      :disable="!isAgreed"
    />
  </q-form>
</template>

<script setup>
import { ref } from 'vue';
import { useEstimateStore } from '../stores/estimate';

const store = useEstimateStore();

// 체크박스 상태 관리 (기본값 false)
const isAgreed = ref(false);

const form = ref({
  customer_name: '',
  contact: '',
  usage: '',
  budget: null,
  description: ''
});

const handleOrder = async () => {
  // 최종 동의 여부 확인 (버튼 disable 처리가 되어있지만 이중 체크)
  if (!isAgreed.value) {
    alert('개인정보 수집에 동의해 주세요.');
    return;
  }

  // 필수값 체크
  if (!form.value.customer_name || !form.value.contact) {
    alert('성함과 연락처를 입력해 주세요.');
    return;
  }

  // 데이터 전송 (privacy_agreed를 'Y'로 담아서 전달)
  const submitData = {
    ...form.value,
    privacy_agreed: 'Y'
  };

  const success = await store.submitEstimate(submitData);
  
  if (success) {
    alert('견적 요청이 완료되었습니다. 카톡/전화로 연락드리겠습니다!');
    // 폼 및 체크박스 초기화
    form.value = { customer_name: '', contact: '', usage: '', budget: null, description: '' };
    isAgreed.value = false;
  } else {
    alert('제출에 실패했습니다. 서버 상태를 확인해 주세요.');
  }
};
</script>