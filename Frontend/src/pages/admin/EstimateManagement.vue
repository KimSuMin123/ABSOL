<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">
          <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
          <span class="q-ml-sm text-subtitle1 text-grey-8">조립 PC 견적 필터링</span>
        </div>
        <q-space />
        <q-btn color="grey-7" icon="refresh" label="전체 새로고침" @click="loadData" flat />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-6">
          <q-input 
            v-model="searchQuery" 
            placeholder="검색할 고객명을 입력하세요" 
            dense outlined 
            clearable
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6">
          <q-select 
            v-model="statusFilter" 
            :options="['전체', '접수완료', '견적발송중', '견적발송완료']" 
            label="진행 상태 필터" 
            dense outlined 
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="filteredEstimates.length === 0 && !loading" class="col-12 text-center q-pa-xl text-grey-6 bg-white rounded-borders shadow-1">
        조건에 맞는 견적 내역이 없습니다.
      </div>

      <div v-for="estimate in filteredEstimates" :key="estimate.estimate_id" class="col-12">
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
                  dense outlined options-dense bg-color="white"
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
import { ref, onMounted, computed } from 'vue'; // computed 추가
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const estimates = ref([]);
const loading = ref(false);

// 필터링을 위한 상태값
const searchQuery = ref('');
const statusFilter = ref('전체');

// [핵심] 프론트엔드 실시간 필터 로직
const filteredEstimates = computed(() => {
  return estimates.value.filter(estimate => {
    // 1. 고객명 검색 (대소문자 무시 및 빈값 처리)
    const name = estimate.customer_name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.value.toLowerCase());

    // 2. 상태 필터 체크
    const matchesStatus = statusFilter.value === '전체' || estimate.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://svc.sel3.cloudtype.app:30209/api/estimates');
    if (res.data && res.data.success) {
      estimates.value = res.data.data;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '데이터 로드 실패' });
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case '접수완료': return 'blue';
    case '견적발송중': return 'orange';
    case '견적발송완료': return 'green';
    default: return 'grey';
  }
};

const updateStatus = async (id, newStatus) => {
  try {
    const res = await axios.patch(`http://svc.sel3.cloudtype.app:30209/api/estimates/${id}/status`, {
      status: newStatus
    });
    if (res.data.success) {
      $q.notify({ color: 'positive', message: `상태 변경: ${newStatus}`, timeout: 1000 });
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '상태 변경 오류' });
    loadData();
  }
};

onMounted(loadData);
</script>