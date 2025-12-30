<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-lg bg-white q-pa-md shadow-1 rounded-borders">
      <div class="text-h6 text-weight-bold">
        <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
        <span class="q-ml-sm text-subtitle1 text-grey-8">조립 PC 견적 접수 현황</span>
      </div>
      <q-space />
      <q-btn color="grey-7" icon="refresh" label="새로고침" @click="loadData" flat />
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="estimates.length === 0 && !loading" class="col-12 text-center q-pa-xl text-grey-6 bg-white shadow-1 rounded-borders">
        접수된 견적 내역이 없습니다.
      </div>

      <div v-for="estimate in estimates" :key="estimate.estimate_id" class="col-12">
        <q-card flat bordered class="estimate-card shadow-1">
          <q-card-section horizontal>
            <div class="col-auto flex flex-center bg-teal-1 q-ma-sm rounded-borders" style="width: 120px; height: 120px">
              <q-icon name="desktop_windows" size="64px" color="teal-7" />
            </div>

            <q-card-section class="col-3 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge color="teal-8" class="q-mr-sm">견적요청</q-badge>
                <div class="text-h6 text-weight-bold">{{ estimate.customer_name }} 고객님</div>
              </div>
              <div class="text-subtitle2 text-grey-8">
                <q-icon name="phone" size="xs" class="q-mr-xs" />{{ estimate.contact }}
              </div>
              <div class="text-weight-bold text-teal-9 q-mt-sm">
                <q-icon name="label" size="xs" class="q-mr-xs" />용도: {{ estimate.usage }}
              </div>
            </q-card-section>

            <q-card-section class="col q-py-md border-left">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">희망 예산 및 추가 요청</div>
              <div class="text-subtitle1 text-weight-bolder text-primary q-mb-xs">
                {{ estimate.budget ? estimate.budget.toLocaleString() : 0 }} 만원
              </div>
              <div class="text-body2 bg-grey-1 q-pa-sm rounded-borders scroll" style="height: 45px">
                {{ estimate.description || '추가 요청사항 없음' }}
              </div>
            </q-card-section>

            <q-card-section class="col-3 q-py-md flex flex-center border-left bg-grey-1">
              <div class="text-center full-width q-px-md">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">진행 상태 관리</div>
                <q-select
                  v-model="estimate.status"
                  :options="['접수완료', '견적발송중', '견적발송완료']"
                  dense
                  outlined
                  options-dense
                  bg-color="white"
                  style="font-size: 0.9rem"
                  @update:model-value="(val) => updateStatus(estimate.estimate_id, val)"
                >
                  <template v-slot:append>
                    <q-badge 
                      rounded 
                      :color="getStatusColor(estimate.status)" 
                      style="width: 12px; height: 12px; padding: 0"
                    />
                  </template>
                </q-select>
                <div class="text-caption text-grey-6 q-mt-md">
                  신청일: <span class="text-weight-bold">{{ estimate.createdAt?.substring(0, 10) }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="teal" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const estimates = ref([]);
const loading = ref(false);

// 데이터 불러오기
const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/estimates');
    if (res.data && res.data.success) {
      estimates.value = res.data.data;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '견적 데이터를 불러오지 못했습니다.' });
    console.error('견적 로드 에러:', error);
  } finally {
    loading.value = false;
  }
};

// 상태별 색상 지정
const getStatusColor = (status) => {
  switch (status) {
    case '접수완료': return 'blue';
    case '견적발송중': return 'orange';
    case '견적발송완료': return 'green';
    default: return 'grey';
  }
};

// 서버에 상태 업데이트 요청 (PATCH 사용)
const updateStatus = async (id, newStatus) => {
  try {
    const res = await axios.patch(`http://localhost:3000/api/estimates/${id}/status`, {
      status: newStatus
    });
    if (res.data.success) {
      $q.notify({
        color: 'positive',
        message: `상태가 [${newStatus}](으)로 변경되었습니다.`,
        icon: 'check',
        timeout: 1000,
        position: 'top'
      });
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '상태 변경 처리 중 오류가 발생했습니다.' });
    loadData(); // 실패 시 원래 데이터로 복구하기 위해 다시 로드
  }
};

onMounted(loadData);
</script>

<style scoped>
.estimate-card {
  transition: all 0.3s;
  background: white;
  border-radius: 8px;
}
.estimate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
}
.border-left {
  border-left: 1px solid #e0e0e0;
}
/* 스크롤바 디자인 (내용이 길 때) */
.scroll::-webkit-scrollbar {
  width: 4px;
}
.scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
</style>