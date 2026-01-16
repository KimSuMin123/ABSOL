<template>
  <q-card flat bordered class="shadow-2 bg-grey-1 q-mt-md">
    <q-card-section class="q-pb-none">
      <div class="text-h6 text-weight-bolder text-indigo-9">
        <q-icon name="save" size="sm" class="q-mr-xs" /> 내 데이터 복구 현황
      </div>
    </q-card-section>
    
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-grid color="indigo" size="50px" />
      <div class="q-mt-md text-grey-7">복구 내역을 불러오는 중입니다...</div>
    </div>

    <div v-else-if="recoveries.length === 0" class="text-center q-pa-xl bg-white rounded-borders border-dashed-indigo q-ma-md">
      <q-icon name="cloud_off" size="64px" color="indigo-1" />
      <div class="text-h6 text-indigo-2 q-mt-md">진행 중인 데이터 복구 내역이 없습니다.</div>
    </div>

    <div v-else class="column q-gutter-y-md q-pa-md">
      <q-card v-for="item in recoveries" :key="item.repair_id" flat bordered class="recovery-item-card overflow-hidden bg-white shadow-1">
        <q-card-section class="q-pa-md">
          <div class="row items-start no-wrap">
            <div class="col">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-h6 text-weight-bold text-indigo-10 ellipsis" style="max-width: 70%;">
                  {{ item.symptoms }}
                </div>
                <q-badge :color="getStatusColor(item.status)" class="text-weight-bold q-px-sm" style="font-size: 13px;">
                  {{ item.status }}
                </q-badge>
              </div>

              <div class="row items-center q-gutter-x-sm q-mb-md text-grey-7">
                <q-separator vertical inset class="q-mx-xs" />
                <span class="text-weight-bold">{{ item.repair_type }}</span>
                <q-separator vertical inset class="q-mx-xs" />
                <span>접수일: {{ formatDate(item.createdAt) }}</span>
              </div>

              <div v-if="item.tracking_number && String(item.tracking_number).trim() !== ''" class="delivery-box-indigo q-pa-sm rounded-borders bg-blue-1">
                <div class="row items-center justify-between">
                  <div class="column">
                    <span class="text-caption text-blue-9 text-weight-bold">
                      <q-icon name="local_shipping" size="16px" /> 
                      {{ getCompanyName(item.delivery_company) }}
                    </span>
                    <span class="text-body2 text-blue-8 text-weight-medium">송장번호: {{ item.tracking_number }}</span>
                  </div>
                  <q-btn 
                    color="blue-7" 
                    label="배송 조회" 
                    icon="search" 
                    unelevated 
                    size="sm" 
                    class="q-px-md"
                    @click="openTracking(item)" 
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';

const $q = useQuasar();
const userStore = useUserStore();

const recoveries = ref([]); 
const loading = ref(false);

const loadRecoveries = async () => {
  if (!userStore.user?.id) return;
  loading.value = true;
  try {
    // [수정] 데이터 복구 전용 API 엔드포인트 호출
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/data-repairs/user/${userStore.user.id}`);
    if (res.data.success) {
      recoveries.value = res.data.data || [];
    }
  } catch (err) {
    console.error(err);
    $q.notify({ color: 'negative', message: '복구 내역 로드 실패' });
  } finally {
    loading.value = false;
  }
};

onMounted(loadRecoveries);

// 배송 조회 (기존 로직 유지)
const openTracking = async (item) => {
  $q.loading.show({ message: '배송 정보 확인 중...' });
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/delivery/track`, {
      params: { 
        t_code: item.delivery_company, 
        t_invoice: String(item.tracking_number).replace(/[^0-9]/g, '') 
      }
    });
    if (res.data.success) {
      const tracking = res.data.data;
      const history = tracking.trackingDetails.map(d => `
        <div class="q-mb-sm" style="border-left: 2px solid #3f51b5; padding-left: 10px;">
          <div class="text-bold text-primary">${d.kind}</div>
          <div class="text-caption">${d.timeString} | ${d.where}</div>
        </div>
      `).reverse().join('');

      $q.dialog({
        title: `<div class="text-indigo text-bold">실시간 배송 상태</div>`,
        message: `<div class="q-mb-sm">상태: <b class="text-indigo-7">${tracking.levelName}</b></div><div style="max-height: 250px; overflow-y: auto;">${history}</div>`,
        html: true, ok: { label: '닫기', color: 'indigo', flat: true }
      });
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '운송장 정보를 다시 확인해주세요.' });
  } finally { $q.loading.hide(); }
};

const getCompanyName = (code) => {
  const companies = { '04': 'CJ대한통운', '01': '우체국택배', '05': '한진택배', '06': '로젠택배', '08': '롯데택배' };
  return companies[code] || `지정택배(${code})`;
};

// [수정] 데이터 복구 단계에 최적화된 색상
const getStatusColor = (s) => {
  const colors = { 
    '접수완료': 'grey-7', 
    '센터입고': 'cyan-8',
    '복구중': 'orange-9', 
    '복구완료': 'green-8', 
    '배송중': 'blue-8', 
    '수령완료': 'indigo-9',
    '복구불가판정': 'red-8',
    '반송중': 'brown-6'
  };
  return colors[s] || 'grey';
};

const formatDate = (d) => d ? d.substring(0, 10) : '';
</script>

<style scoped>
.recovery-item-card { border-radius: 16px; transition: all 0.3s ease; border: 1px solid #e0e4e8; }
.recovery-item-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(63, 81, 181, 0.15) !important; border-color: #c5cae9; }
.delivery-box-indigo { border: 1px dashed #90caf9; border-radius: 8px; }
.border-dashed-indigo { border: 2.5px dashed #e8eaf6; border-radius: 16px; }
</style>