<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">
          <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
          <span class="q-ml-sm text-subtitle1 text-grey-8">수리 내역 관리</span>
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
          <q-select v-model="statusFilter" :options="['전체', '접수완료', '수리중', '수리완료', '배송중', '수령완료', '수리불가판정']" label="진행 단계 필터" dense outlined />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="filteredRepairs.length === 0" class="col-12 text-center q-pa-xl text-grey-6 bg-white rounded-borders">
        조건에 맞는 수리 내역이 없습니다.
      </div>

      <div v-for="repair in filteredRepairs" :key="repair.repair_id" class="col-12">
        <q-card flat bordered class="repair-card shadow-1">
          <q-card-section horizontal>
            <q-card-section class="col-3">
              <div class="row items-center q-mb-sm">
                <q-badge :color="getTypeColor(repair.repair_type)" class="q-mr-sm">{{ repair.repair_type }}</q-badge>
                <div class="text-h6 text-weight-bold">{{ repair.customer_name }}</div>
              </div>
              <div class="text-caption text-grey-8"><q-icon name="phone" /> {{ repair.contact }}</div>
              <div class="text-caption text-grey-7 ellipsis"><q-icon name="location_on" /> {{ repair.address }}</div>
            </q-card-section>

            <q-card-section class="col-2 border-left">
              <div class="text-caption text-weight-bold text-grey-7">고장 증상</div>
              <div class="text-body2 bg-grey-2 q-pa-sm rounded-borders scroll" style="height: 60px">
                {{ repair.symptoms }}
              </div>
            </q-card-section>

            <q-card-section class="col-7 border-left row q-col-gutter-sm items-start q-pa-md">
              <div class="col-3">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">수리 방식</div>
                <q-select v-model="repair.repair_type" :options="['수리', '방문수리', '수리불가']" dense outlined bg-color="white" @update:model-value="(val) => updateRepair(repair, 'type', val)" />
              </div>

              <div class="col-3">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">진행 단계</div>
                <q-select v-model="repair.status" :options="getStatusOptions(repair.repair_type)" dense outlined bg-color="white" @update:model-value="(val) => updateRepair(repair, 'status', val)" />
              </div>

              <div class="col-6 row q-col-gutter-x-xs" v-if="['배송중', '반송중'].includes(repair.status)">
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">택배사</div>
                  <q-select
                    v-model="repair.delivery_company"
                    :options="deliveryCompanies"
                    option-label="Name"
                    option-value="Code"
                    outlined dense bg-color="white"
                    emit-value
                    map-options
                    @update:model-value="updateRepair(repair, 'company', repair.delivery_company)"
                  />
                </div>
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">운송장 번호</div>
                  <q-input v-model="repair.tracking_number" dense outlined bg-color="white" @blur="updateRepair(repair, 'tracking', repair.tracking_number)" />
                </div>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>
    
    <q-inner-loading :showing="loading"><q-spinner-dots size="50px" color="primary" /></q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const repairs = ref([]);
const loading = ref(false);
const deliveryCompanies = ref([]);

const searchQuery = ref('');
const statusFilter = ref('전체');

const filteredRepairs = computed(() => {
  return repairs.value.filter(repair => {
    const matchesSearch = (repair.customer_name || '').includes(searchQuery.value || '') || (repair.contact || '').includes(searchQuery.value || '');
    const matchesStatus = statusFilter.value === '전체' || repair.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const statusMap = {
  '수리': ['접수완료', '수리중', '수리완료', '배송중', '수령완료'],
  '방문수리': ['접수완료', '센터입고', '수리중', '수리완료', '배송중', '수령완료'],
  '수리불가': ['접수완료', '수리불가판정', '반송중', '수령완료']
};

const getStatusOptions = (type) => statusMap[type] || ['접수완료'];
const getTypeColor = (type) => (type === '방문수리' ? 'orange-9' : type === '수리불가' ? 'red-9' : 'blue-9');

// 데이터 로드 함수들
const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/repairs');
    repairs.value = res.data.data;
  } catch (err) {
    $q.notify({ color: 'negative', message: '수리 내역 로드 실패' });
  } finally {
    loading.value = false;
  }
};

const loadCompanies = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/delivery/companyList');
    // 스마트 택배 API 응답 구조에 맞춰 할당
    deliveryCompanies.value = res.data.Company || []; 
  } catch (err) {
    console.error('택배사 로드 에러:', err);
  }
};

const updateRepair = async (repair, mode, value) => {
  try {
    const payload = {
      repair_type: repair.repair_type,
      status: repair.status,
      tracking_number: repair.tracking_number,
      delivery_company: repair.delivery_company // 택배사 코드 추가
    };
    
    // 수리 방식 변경 시 상태 초기화 로직
    if (mode === 'type') payload.status = '접수완료';

    await axios.patch(`http://localhost:3000/api/repairs/${repair.repair_id}/status`, payload);
    $q.notify({ color: 'positive', message: '저장되었습니다.', timeout: 800 });
    
    if (mode === 'type') loadData();
  } catch (err) {
    $q.notify({ color: 'negative', message: '업데이트 실패' });
  }
};

// [수정된 부분] Lifecycle Hook에서 순차적 호출
onMounted(async () => {
  await Promise.all([loadData(), loadCompanies()]);
});
</script>

<style scoped>
.border-left { border-left: 1px solid #eeeeee; }
.repair-card { transition: transform 0.2s; border-radius: 8px; }
.repair-card:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important; }
</style>