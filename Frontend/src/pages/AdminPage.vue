<template>
  <div class="q-pa-md q-gutter-y-md">
    <q-table
      title="📋 조립 PC 견적 접수 내역"
      :rows="estimates"
      :columns="estimateColumns"
      row-key="estimate_id"
      flat bordered
      no-data-label="데이터가 없습니다."
    />

    <q-table
      title="🔧 컴퓨터 수리 접수 내역"
      :rows="repairs"
      :columns="repairColumns"
      row-key="repair_id"
      flat bordered
      no-data-label="데이터가 없습니다."
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const estimates = ref([]);
const repairs = ref([]);

// 1. 컬럼 정의: field를 함수가 아닌 문자열로 먼저 테스트해보거나 방어코드 추가
const estimateColumns = [
  { name: 'customer_name', label: '성함', field: 'customer_name', align: 'left' },
  { name: 'contact', label: '연락처', field: 'contact', align: 'left' },
  { name: 'usage', label: '용도', field: 'usage', align: 'left' },
  { name: 'budget', label: '예산(만)', field: 'budget', align: 'right' },
  { 
    name: 'createdAt', 
    label: '신청일', 
    // row.createdAt이 있을 때만 자르도록 수정 (매우 중요)
    field: row => row.createdAt ? row.createdAt.substring(0, 10) : '-', 
    align: 'center' 
  }
];

const repairColumns = [
  { name: 'customer_name', label: '성함', field: 'customer_name', align: 'left' },
  { name: 'contact', label: '연락처', field: 'contact', align: 'left' },
  { name: 'address', label: '주소', field: 'address', align: 'left' },
  { name: 'symptoms', label: '증상', field: 'symptoms', align: 'left' },
  { 
    name: 'createdAt', 
    label: '신청일', 
    field: row => row.createdAt ? row.createdAt.substring(0, 10) : '-', 
    align: 'center' 
  }
];

const loadData = async () => {
  try {
    const resEst = await axios.get('http://localhost:3000/api/estimates');
    const resRep = await axios.get('http://localhost:3000/api/repairs');

    // 콘솔에 데이터가 찍히는지 확인
    console.log('API 응답 확인:', resEst.data);

    // .data.data 구조가 맞는지 확인 후 할당
    if (resEst.data && resEst.data.success) {
      estimates.value = resEst.data.data;
    }
    if (resRep.data && resRep.data.success) {
      repairs.value = resRep.data.data;
    }
  } catch (error) {
    console.error('데이터 로드 중 에러:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>