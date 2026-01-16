<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">
          <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
          <span class="q-ml-sm text-subtitle1 text-grey-8">데이터 복구 내역 관리</span>
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
          <q-select 
            v-model="statusFilter" 
            :options="['전체', '접수완료', '복구중', '복구완료', '배송중', '수령완료', '센터입고', '복구불가판정', '반송중']" 
            label="진행 단계 필터" 
            dense outlined 
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="filteredRecoveries.length === 0" class="col-12 text-center q-pa-xl text-grey-6 bg-white rounded-borders">
        조건에 맞는 복구 내역이 없습니다.
      </div>

      <div v-for="item in filteredRecoveries" :key="item.repair_id" class="col-12">
        <q-card flat bordered class="repair-card shadow-1">
          <q-card-section horizontal>
            <q-card-section class="col-3">
              <div class="row items-center q-mb-sm">
                <q-badge :color="getTypeColor(item.repair_type)" class="q-mr-sm">{{ item.repair_type }}</q-badge>
                <div class="text-h6 text-weight-bold">{{ item.customer_name }}</div>
              </div>
              <div class="text-caption text-grey-8"><q-icon name="phone" /> {{ item.contact }}</div>
              <div class="text-caption text-grey-7 ellipsis"><q-icon name="location_on" /> {{ item.address }}</div>
            </q-card-section>

            <q-card-section class="col-2 border-left">
              <div class="text-caption text-weight-bold text-grey-7">손실 증상</div>
              <div class="text-body2 bg-grey-2 q-pa-sm rounded-borders scroll" style="height: 60px">
                {{ item.symptoms }}
              </div>
            </q-card-section>

            <q-card-section class="col-7 border-left row q-col-gutter-sm items-start q-pa-md">
              <div class="col-3">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">복구 유형</div>
                <q-select 
                  v-model="item.repair_type" 
                  :options="['복구', '방문복구', '복구불가']" 
                  dense outlined bg-color="white" 
                  @update:model-value="(val) => updateStatus(item, 'type', val)" 
                />
              </div>

              <div class="col-3">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">진행 단계</div>
                <q-select 
                  v-model="item.status" 
                  :options="getStatusOptions(item.repair_type)" 
                  dense outlined bg-color="white" 
                  @update:model-value="(val) => updateStatus(item, 'status', val)" 
                />
              </div>

              <div class="col-6 row q-col-gutter-x-xs" v-if="['배송중', '반송중'].includes(item.status)">
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">택배사</div>
                  <q-select
                    v-model="item.delivery_company"
                    :options="deliveryCompanies"
                    option-label="Name"
                    option-value="Code"
                    outlined dense bg-color="white"
                    emit-value
                    map-options
                    @update:model-value="updateStatus(item, 'company', item.delivery_company)"
                  />
                </div>
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">운송장 번호</div>
                  <q-input 
                    v-model="item.tracking_number" 
                    dense outlined bg-color="white" 
                    @blur="updateStatus(item, 'tracking', item.tracking_number)" 
                  />
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
const recoveries = ref([]);
const loading = ref(false);
const deliveryCompanies = ref([]);

const searchQuery = ref('');
const statusFilter = ref('전체');

// 필터링 로직
const filteredRecoveries = computed(() => {
  return recoveries.value.filter(item => {
    const matchesSearch = (item.customer_name || '').includes(searchQuery.value || '') || 
                          (item.contact || '').includes(searchQuery.value || '');
    const matchesStatus = statusFilter.value === '전체' || item.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

// 복구 유형별 진행 단계 맵핑 (모델 ENUM 반영)
const statusMap = {
  '복구': ['접수완료', '복구중', '복구완료', '배송중', '수령완료'],
  '방문복구': ['접수완료', '센터입고', '복구중', '복구완료', '배송중', '수령완료'],
  '복구불가': ['접수완료', '복구불가판정', '반송중', '수령완료']
};

const getStatusOptions = (type) => statusMap[type] || ['접수완료'];
const getTypeColor = (type) => {
  if (type === '복구') return 'blue-9';
  if (type === '방문복구') return 'orange-9';
  return 'red-9';
};

// 데이터 로드
const loadData = async () => {
  loading.value = true;
  try {
    // [중요] 데이터 복구 API 엔드포인트
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/data-repairs');
    recoveries.value = res.data.data;
  } catch (err) {
    $q.notify({ color: 'negative', message: '복구 내역 로드 실패' });
  } finally {
    loading.value = false;
  }
};

const loadCompanies = async () => {
  try {
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/delivery/companyList');
    deliveryCompanies.value = res.data.Company || []; 
  } catch (err) {
    console.error('택배사 로드 에러:', err);
  }
};

// 상태 업데이트
const updateStatus = async (item, mode, value) => {
  try {
    const payload = {
      repair_type: item.repair_type,
      status: item.status,
      tracking_number: item.tracking_number,
      delivery_company: item.delivery_company
    };
    
    // 유형 변경 시 상태 초기화
    if (mode === 'type') payload.status = '접수완료';

    await axios.patch(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/data-repairs/${item.repair_id}/status`, payload);
    $q.notify({ color: 'positive', message: '업데이트 성공', timeout: 800 });
    
    if (mode === 'type') loadData();
  } catch (err) {
    $q.notify({ color: 'negative', message: '업데이트 실패' });
  }
};

onMounted(async () => {
  await Promise.all([loadData(), loadCompanies()]);
});
</script>

<style scoped>
.border-left { border-left: 1px solid #eeeeee; }
.repair-card { transition: transform 0.2s; border-radius: 8px; }
.repair-card:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important; }
</style>