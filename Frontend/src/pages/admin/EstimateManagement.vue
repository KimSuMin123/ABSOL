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
            </q-card-section>

            <q-card-section class="col-3 border-left">
              <div class="text-caption text-weight-bold text-grey-7">희망 예산</div>
              <div class="text-subtitle1 text-weight-bolder text-primary q-mb-sm">
                {{ estimate.budget ? estimate.budget.toLocaleString() : 0 }} 만원
              </div>
              <div class="text-caption text-weight-bold text-grey-7">용도: {{ estimate.usage }}</div>
            </q-card-section>

            <q-card-section class="col-6 border-left row q-col-gutter-sm items-start q-pa-md">
              <div class="col-5">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">진행 상태</div>
                <q-select
                  v-model="estimate.status"
                  :options="['접수완료', '견적발송중', '견적발송완료', '배송중', '배송완료']"
                  dense outlined bg-color="white"
                  @update:model-value="(val) => updateEstimate(estimate)"
                />
                
                <q-btn 
                  v-if="estimate.status === '견적발송중'"
                  label="견적서 작성하러 가기" 
                  color="primary" 
                  icon="edit_note"
                  class="full-width q-mt-md"
                  @click="goToDetail(estimate)"
                />

                <q-btn 
                  v-if="['견적발송완료', '배송중', '배송완료'].includes(estimate.status)"
                  label="견적서 확인 (PDF)" 
                  color="secondary" 
                  icon="picture_as_pdf"
                  class="full-width q-mt-md"
                  @click="viewPDF(estimate)"
                />
              </div>

              <div class="col-7 row q-col-gutter-x-xs" v-if="['배송중', '배송완료'].includes(estimate.status)">
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">택배사</div>
                  <q-select
                    v-model="estimate.delivery_company"
                    :options="deliveryCompanies"
                    option-label="Name"
                    option-value="Code"
                    outlined dense bg-color="white"
                    emit-value map-options
                    @update:model-value="updateEstimate(estimate)"
                  />
                </div>
                <div class="col-6">
                  <div class="text-caption text-weight-bold text-primary q-mb-xs">운송장 번호</div>
                  <q-input 
                    v-model="estimate.tracking_number" 
                    dense outlined bg-color="white" 
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
import { useRouter } from 'vue-router'; // 라우터 추가

const $q = useQuasar();
const router = useRouter(); // 라우터 인스턴스

const estimates = ref([]);
const loading = ref(false);
const deliveryCompanies = ref([]);
const searchQuery = ref('');
const statusFilter = ref('전체');

// 견적서 작성 페이지 이동 함수
const goToDetail = (estimate) => {
  router.push({
    path: '/admin/estimatesDetail',
    query: {
      id: estimate.estimate_id,
      name: estimate.customer_name,
      contact: estimate.contact,
      address: estimate.full_address
    }
  });
};

const viewPDF = (estimate) => {
  // 1. 경로가 아예 없는 경우
  if (!estimate.pdf_path) {
    $q.notify({ 
      color: 'warning', 
      icon: 'priority_high',
      message: '아직 생성된 견적서 파일이 없습니다. [견적서 작성]을 먼저 완료해주세요.' 
    });
    return;
  }

  // 2. 경로 가공 (역슬래시를 슬래시로 변경)
  const baseUrl = 'https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app';
  let cleanPath = estimate.pdf_path.replace(/\\/g, '/');
  
  // 3. 만약 경로 앞에 /가 없다면 추가
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

  const fullUrl = `${baseUrl}${cleanPath}`;
  
  console.log("접속 시도 URL:", fullUrl); // 디버깅용
  window.open(fullUrl, '_blank');
};
// (기존 loadData, loadCompanies, updateEstimate 함수들은 동일하게 유지...)
const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates/pdf');
    if (res.data && res.data.success) {
      estimates.value = res.data.data;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '데이터 로드 실패' });
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

const updateEstimate = async (estimate) => {
  try {
    const payload = {
      status: estimate.status,
      tracking_number: estimate.tracking_number,
      delivery_company: estimate.delivery_company
    };
    await axios.patch(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates/${estimate.estimate_id}/status`, payload);
    $q.notify({ color: 'positive', message: '저장되었습니다.', timeout: 800 });
  } catch (error) {
    $q.notify({ color: 'negative', message: '업데이트 실패' });
    loadData();
  }
};

const filteredEstimates = computed(() => {
  return estimates.value.filter(estimate => {
    const search = searchQuery.value?.toLowerCase() || '';
    const matchesSearch = (estimate.customer_name || '').toLowerCase().includes(search) || 
                          (estimate.contact || '').includes(search);
    const matchesStatus = statusFilter.value === '전체' || estimate.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

onMounted(async () => {
  await Promise.all([loadData(), loadCompanies()]);
});
</script>

<style scoped>
.border-left { border-left: 1px solid #eeeeee; }
.estimate-card { transition: transform 0.2s; border-radius: 8px; }
.estimate-card:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important; }
</style>