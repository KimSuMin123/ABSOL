<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">
          <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
          <span class="q-ml-sm text-subtitle1 text-grey-8">조립 PC 견적/배송 관리</span>
        </div>
        <q-space />
        <q-btn color="grey-7" icon="refresh" label="전체 새로고침" @click="loadData" flat />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-6">
          <q-input v-model="searchQuery" placeholder="고객명 또는 연락처 입력" dense outlined clearable>
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6">
          <q-select v-model="statusFilter" :options="['전체', '접수완료', '견적발송중', '견적발송완료', '배송중', '배송완료']" label="진행 상태 필터" dense outlined />
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
            <q-card-section class="col-3">
              <div class="row items-center q-mb-sm">
                <q-badge color="teal-8" class="q-mr-sm">PC 견적</q-badge>
                <div class="text-h6 text-weight-bold">{{ estimate.customer_name }}</div>
              </div>
              <div class="text-caption text-grey-8 q-mb-xs"><q-icon name="phone" /> {{ estimate.contact }}</div>
              <div class="text-caption text-grey-7">
                <q-icon name="location_on" /> {{ estimate.full_address || '주소 정보 없음' }}
              </div>
              <div class="text-weight-bold text-teal-9 q-mt-sm">
                <q-icon name="computer" size="xs" /> 용도: {{ estimate.usage }}
              </div>
            </q-card-section>

            <q-card-section class="col-3 border-left">
              <div class="text-caption text-weight-bold text-grey-7">희망 예산</div>
              <div class="text-subtitle1 text-weight-bolder text-primary q-mb-sm">
                {{ estimate.budget ? estimate.budget.toLocaleString() : 0 }} 만원
              </div>
              <div class="text-caption text-weight-bold text-grey-7">추가 요청</div>
              <div class="text-body2 bg-grey-2 q-pa-sm rounded-borders scroll" style="height: 60px">
                {{ estimate.description || '요청사항 없음' }}
              </div>
            </q-card-section>

            <q-card-section class="col-6 border-left row q-col-gutter-sm items-start q-pa-md">
              <div class="col-4">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">진행 상태</div>
                <q-select
                  v-model="estimate.status"
                  :options="['접수완료', '견적발송중', '견적발송완료', '배송중', '배송완료']"
                  dense outlined bg-color="white"
                  @update:model-value="(val) => updateEstimate(estimate)"
                />
                <div class="text-caption text-grey-6 q-mt-sm">
                  신청일: {{ estimate.createdAt?.substring(0, 10) }}
                </div>
              </div>

              <div class="col-8 row q-col-gutter-x-xs" v-if="estimate.status === '배송중' || estimate.status === '배송완료'">
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">택배사</div>
                  <q-select
                    v-model="estimate.delivery_company"
                    :options="deliveryCompanies"
                    option-label="Name"
                    option-value="Code"
                    outlined dense bg-color="white"
                    emit-value
                    map-options
                    @update:model-value="updateEstimate(estimate)"
                  />
                </div>
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">운송장 번호</div>
                  <q-input 
                    v-model="estimate.tracking_number" 
                    dense outlined bg-color="white" 
                    placeholder="번호 입력"
                    @blur="updateEstimate(estimate)" 
                  />
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const estimates = ref([]);
const loading = ref(false);
const deliveryCompanies = ref([]);

const searchQuery = ref('');
const statusFilter = ref('전체');

// 검색 및 필터링 로직
const filteredEstimates = computed(() => {
  return estimates.value.filter(estimate => {
    const search = searchQuery.value?.toLowerCase() || '';
    const matchesSearch = (estimate.customer_name || '').toLowerCase().includes(search) || 
                          (estimate.contact || '').includes(search);
    const matchesStatus = statusFilter.value === '전체' || estimate.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

// 데이터 로드
const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates');
    if (res.data && res.data.success) {
      estimates.value = res.data.data;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '데이터 로드 실패' });
  } finally {
    loading.value = false;
  }
};

// 택배사 리스트 로드 (수리 관리와 동일한 API 사용)
const loadCompanies = async () => {
  try {
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/delivery/companyList');
    deliveryCompanies.value = res.data.Company || []; 
  } catch (err) {
    console.error('택배사 로드 에러:', err);
  }
};

// 견적 상태 및 배송 정보 업데이트
const updateEstimate = async (estimate) => {
  try {
    const payload = {
      status: estimate.status,
      tracking_number: estimate.tracking_number,
      delivery_company: estimate.delivery_company
    };

    const res = await axios.patch(
      `https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates/${estimate.estimate_id}/status`, 
      payload
    );

    if (res.data.success) {
      $q.notify({ color: 'positive', message: '변경사항이 저장되었습니다.', timeout: 800 });
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '업데이트 실패' });
    loadData(); // 에러 시 데이터 롤백을 위해 재로드
  }
};

onMounted(async () => {
  await Promise.all([loadData(), loadCompanies()]);
});
</script>

<style scoped>
.border-left { border-left: 1px solid #eeeeee; }
.estimate-card { transition: transform 0.2s; border-radius: 8px; }
.estimate-card:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important; }
</style>