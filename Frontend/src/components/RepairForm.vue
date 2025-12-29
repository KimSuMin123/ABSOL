<template>
  <q-form @submit="handleRepair" class="q-gutter-md">
  <h6>PC 수리 요청</h6>
    <q-input v-model="form.customer_name" label="성함" outlined dense />
    <q-input v-model="form.contact" label="연락처" mask="###-####-####" outlined dense />
    
    <q-input v-model="form.address" label="방문/회수 주소" outlined dense hint="정확한 주소를 입력해 주세요." />

    <q-input
      v-model="form.symptoms"
      type="textarea"
      label="고장 증상 (최대 200자)"
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
      label="수리 신청하기" 
      type="submit" 
      color="secondary" 
      class="full-width"
      :loading="loading" 
      :disable="!isAgreed"
    />
  </q-form>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const isAgreed = ref(false);
const loading = ref(false);

const form = ref({
  customer_name: '',
  contact: '',
  address: '',
  symptoms: ''
});

const handleRepair = async () => {
  loading.ref = true;
  try {
    const res = await axios.post('http://localhost:3000/api/repairs', form.value);
    if (res.data.success) {
      alert('수리 신청이 접수되었습니다. 확인 후 연락드리겠습니다.');
      // 폼 초기화 로직...
    }
  } catch (err) {
    alert('신청 중 오류가 발생했습니다.');
  } finally {
    loading.ref = false;
  }
};
</script>