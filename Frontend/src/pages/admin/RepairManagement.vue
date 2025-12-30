<template>
  <q-page class="q-pa-md">
    <q-table
      title="🔧 컴퓨터 수리 접수 내역"
      :rows="repairs"
      :columns="repairColumns"
      row-key="repair_id"
      flat bordered
      :loading="loading"
      no-data-label="접수된 수리 내역이 없습니다."
    >
      <template v-slot:body-cell-symptoms="props">
        <q-td :props="props" class="ellipsis" style="max-width: 200px">
          {{ props.value }}
          <q-tooltip>{{ props.value }}</q-tooltip>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const repairs = ref([]);
const loading = ref(false);

const repairColumns = [
  { name: 'customer_name', label: '성함', field: 'customer_name', align: 'left', sortable: true },
  { name: 'contact', label: '연락처', field: 'contact', align: 'left' },
  { name: 'address', label: '주소', field: 'address', align: 'left' },
  { name: 'symptoms', label: '증상', field: 'symptoms', align: 'left' },
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
    const res = await axios.get('http://localhost:3000/api/repairs');
    if (res.data && res.data.success) {
      repairs.value = res.data.data;
    }
  } catch (error) {
    console.error('수리 로드 에러:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>