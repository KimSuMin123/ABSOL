<template>
  <q-page class="q-pa-md">
    <q-table
      title="📋 조립 PC 견적 접수 내역"
      :rows="estimates"
      :columns="estimateColumns"
      row-key="estimate_id"
      flat bordered
      :loading="loading"
      no-data-label="접수된 견적 내역이 없습니다."
    >
      <template v-slot:body-cell-budget="props">
        <q-td :props="props">
          {{ props.value.toLocaleString() }} 만원
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const estimates = ref([]);
const loading = ref(false);

const estimateColumns = [
  { name: 'customer_name', label: '성함', field: 'customer_name', align: 'left', sortable: true },
  { name: 'contact', label: '연락처', field: 'contact', align: 'left' },
  { name: 'usage', label: '용도', field: 'usage', align: 'left' },
  { name: 'budget', label: '예산', field: 'budget', align: 'right', sortable: true },
  { 
    name: 'createdAt', 
    label: '신청일', 
    field: row => row.createdAt ? row.createdAt.substring(0, 10) : '-', 
    align: 'center',
    sortable: true
  }
];

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/estimates');
    if (res.data && res.data.success) {
      estimates.value = res.data.data;
    }
  } catch (error) {
    console.error('견적 로드 에러:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>