<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row q-col-gutter-md q-mb-lg">
     

      <div class="col-12 col-md-4" @click="$router.push('/admin/orders')">
        <q-card class="bg-blue-8 text-white shadow-2 cursor-pointer hover-up">
          <q-card-section>
            <div class="text-subtitle2">신규 주문 (미처리)</div>
            <div class="text-h4 text-weight-bolder">{{ stats.newOrderCount }}건</div>
            <q-icon name="shopping_cart" class="absolute-right q-ma-md" size="56px" style="opacity: 0.2" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4" @click="$router.push('/admin/repairs')">
        <q-card class="bg-teal-8 text-white shadow-2 cursor-pointer hover-up">
          <q-card-section>
            <div class="text-subtitle2">수리 접수 (미처리)</div>
            <div class="text-h4 text-weight-bolder">{{ stats.newRepairCount }}건</div>
            <q-icon name="build" class="absolute-right q-ma-md" size="56px" style="opacity: 0.2" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4" @click="$router.push('/admin/estimates')">
        <q-card class="bg-orange-9 text-white shadow-2 cursor-pointer hover-up">
          <q-card-section>
            <div class="text-subtitle2">미확인 견적</div>
            <div class="text-h4 text-weight-bolder">{{ stats.newEstimateCount }}건</div>
            <q-icon name="description" class="absolute-right q-ma-md" size="56px" style="opacity: 0.2" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-table
          title="신규 주문 (최근 5건)"
          :rows="lists.newOrders"
          :columns="orderCols"
          row-key="order_id"
          dense flat bordered
          :pagination="{ rowsPerPage: 5 }"
          class="bg-white"
        >
    
        </q-table>
      </div>

      <div class="col-12 col-lg-4">
        <q-table
          title="신규 수리 접수"
          :rows="lists.newRepairs"
          :columns="repairCols"
          dense flat bordered
          class="bg-white"
        />
      </div>

      <div class="col-12 col-lg-4">
        <q-table
          title="미확인 견적 요청"
          :rows="lists.newEstimates"
          :columns="estimateCols"
          dense flat bordered
          class="bg-white"
        />
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref(false);
const stats = ref({ todayRevenue: 0, newOrderCount: 0, newRepairCount: 0, newEstimateCount: 0 });
const lists = ref({ newOrders: [], newRepairs: [], newEstimates: [] });

// 테이블 컬럼 정의
// 테이블 컬럼 정의 수정
const orderCols = [
  { name: 'customer_name', label: '고객명', field: 'customer_name', align: 'left' },
  { 
    name: 'product_name', 
    label: '제품명', 
    field: 'product_name', 
    align: 'left'
  },
  { 
    name: 'total_price', 
    label: '금액', 
    field: row => row.total_price ? `${row.total_price.toLocaleString()}원` : '0원', 
    align: 'right' 
  },
];

const repairCols = [
  { name: 'customer_name', label: '고객명', field: 'customer_name', align: 'left' },
  { name: 'repair_type', label: '유형', field: 'repair_type', align: 'center' },
  { name: 'symptoms', label: '고장증상', field: 'symptoms', align: 'right' }
];

const estimateCols = [
  { name: 'customer_name', label: '고객명', field: 'customer_name', align: 'left' },
  { name: 'usage', label: '용도', field: 'usage', align: 'center' },
  { name: 'budget', label: '예산', field: row => `${row.budget}만`, align: 'right' }
];

const loadDashboardData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/dashboard/summary');
    if (res.data.success) {
      stats.value = res.data.stats;
      lists.value = res.data.lists;
    }
  } catch (error) {
    console.error('대시보드 데이터 로드 실패', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadDashboardData);
</script>

<style scoped>
.hover-up:hover {
  transform: translateY(-5px);
  transition: all 0.3s ease;
}
</style>