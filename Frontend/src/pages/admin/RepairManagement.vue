<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-lg bg-white q-pa-md shadow-1 rounded-borders">
      <div class="text-h6 text-weight-bold">
        <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
        <span class="q-ml-sm text-subtitle1 text-grey-8">컴퓨터 수리 접수 현황</span>
      </div>
      <q-space />
      <q-btn color="grey-7" icon="refresh" label="새로고침" @click="loadData" flat />
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="repairs.length === 0 && !loading" class="col-12 text-center q-pa-xl text-grey-6 bg-white shadow-1 rounded-borders">
        접수된 수리 내역이 없습니다.
      </div>

      <div v-for="repair in repairs" :key="repair.repair_id" class="col-12">
        <q-card flat bordered class="repair-card shadow-1">
          <q-card-section horizontal>
            <div class="col-2 flex flex-center bg-blue-1 q-ma-sm rounded-borders" style="max-width: 120px; height: 120px">
              <q-icon name="build_circle" size="64px" color="blue-7" />
            </div>

            <q-card-section class="col-4 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge color="blue-8" class="q-mr-sm">수리접수</q-badge>
                <div class="text-h6 text-weight-bold">{{ repair.customer_name }} 고객님</div>
              </div>
              <div class="text-subtitle2 text-grey-8">
                <q-icon name="phone" size="xs" class="q-mr-xs" />{{ repair.contact }}
              </div>
              <div class="text-caption text-grey-7 q-mt-sm ellipsis-2-lines">
                <q-icon name="location_on" size="xs" class="q-mr-xs" />{{ repair.address }}
              </div>
            </q-card-section>

            <q-card-section class="col-4 q-py-md border-left">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">고장 증상</div>
              <div class="text-body2 bg-grey-1 q-pa-sm rounded-borders scroll" style="height: 70px">
                {{ repair.symptoms }}
              </div>
            </q-card-section>

            <q-card-section class="col-2 q-py-md flex flex-center border-left bg-grey-1">
              <div class="text-center full-width">
                <div class="text-caption text-grey-7">신청일</div>
                <div class="text-weight-bold text-blue-grey-9" style="font-size: 1.1rem">
                  {{ repair.createdAt ? repair.createdAt.substring(0, 10) : '-' }}
                </div>
            
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const repairs = ref([]);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/repairs');
    if (res.data && res.data.success) {
      repairs.value = res.data.data;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '수리 내역 로드 중 오류가 발생했습니다.' });
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.repair-card {
  transition: all 0.3s;
  background: white;
}
.repair-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
.border-left {
  border-left: 1px solid #e0e0e0;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>