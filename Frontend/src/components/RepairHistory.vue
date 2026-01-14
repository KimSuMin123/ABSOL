<template>
   <q-card flat bordered class="shadow-2 bg-grey-1 q-mt-md">
    <q-card-section class="q-pb-none">
      <div class="text-h6 text-weight-bolder text-primary">
         <q-icon name="history" size="sm" class="q-mr-xs" /> 내 수리 및 배송 현황
      </div>
    </q-card-section>
    
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-grid color="primary" size="50px" />
      <div class="q-mt-md text-grey-7">내역을 불러오는 중입니다...</div>
    </div>

    <div v-else-if="repairs && repairs.length === 0" class="text-center q-pa-xl bg-white rounded-borders border-dashed">
      <q-icon name="history_toggle_off" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-5 q-mt-md">진행 중인 수리 내역이 없습니다.</div>
    </div>

    <div v-else-if="repairs && repairs.length > 0" class="column q-gutter-y-md q-pa-md">
      <q-card v-for="repair in repairs" :key="repair.repair_id" flat bordered class="repair-item-card overflow-hidden bg-white shadow-1">
        <q-card-section class="q-pa-md">
          <div class="row items-start no-wrap">
           
            <div class="col">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-h6 text-weight-bold text-dark ellipsis" style="max-width: 70%;">
                  {{ repair.symptoms }}
                </div>
                <q-badge outline :color="getStatusColor(repair.status)" class="text-weight-bold q-px-sm" style="font-size: 13px;">
                  {{ repair.status }}
                </q-badge>
              </div>

              <div class="row items-center q-gutter-x-sm q-mb-md text-grey-7">
                <span class="text-weight-bold text-primary">{{ repair.repair_type }}</span>
                <q-separator vertical inset class="q-mx-xs" />
                <span>접수일: {{ formatDate(repair.createdAt) }}</span>
              </div>

              <div v-if="repair.tracking_number && String(repair.tracking_number).trim() !== ''" class="delivery-box q-pa-sm rounded-borders bg-indigo-1">
                <div class="row items-center justify-between">
                  <div class="column">
                    <span class="text-caption text-indigo-9 text-weight-bold">
                      <q-icon name="local_shipping" size="16px" /> 
                      {{ getCompanyName(repair.delivery_company) }}
                    </span>
                    <span class="text-body2 text-indigo-8 text-weight-medium">송장번호: {{ repair.tracking_number }}</span>
                  </div>
                  <q-btn 
                    color="indigo-7" 
                    label="실시간 배송 조회" 
                    icon="search" 
                    unelevated 
                    size="sm" 
                    class="q-px-md shadow-1"
                    @click="openTracking(repair)" 
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

// 에러 방지: 반드시 빈 배열([])로 초기화
const repairs = ref([]); 
const loading = ref(false);

// 데이터 로드 함수 추가
const loadRepairs = async () => {
  if (!userStore.user?.id) return;
  loading.value = true;
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/repairs/user/${userStore.user.id}`);
    if (res.data.success) {
      repairs.value = res.data.data || [];
    }
  } catch (err) {
    console.error(err);
    $q.notify({ color: 'negative', message: '내역을 불러오지 못했습니다.' });
  } finally {
    loading.value = false;
  }
};

onMounted(loadRepairs);

// 배송 조회 로직
const openTracking = async (item) => {
  $q.loading.show({ message: '배송 정보 로드 중...' });
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
        title: `<div class="text-primary text-bold">실시간 배송 상태</div>`,
        message: `<div class="q-mb-sm">상태: <b class="text-indigo">${tracking.levelName}</b></div><div style="max-height: 250px; overflow-y: auto;">${history}</div>`,
        html: true, ok: { label: '닫기', color: 'primary', flat: true }
      });
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '조회 실패: 운송장 정보를 확인해주세요.' });
  } finally { $q.loading.hide(); }
};

const getCompanyName = (code) => {
  const companies = { '04': 'CJ대한통운', '01': '우체국택배', '05': '한진택배', '06': '로젠택배' };
  return companies[code] || `기타택배(${code})`;
};

const getStatusColor = (s) => {
  const colors = { '접수완료': 'grey-7', '수리중': 'orange-8', '수리완료': 'green-8', '배송중': 'indigo-8', '수령완료': 'purple-8' };
  return colors[s] || 'grey';
};

const getStatusIcon = (s) => {
  const icons = { '접수완료': 'schedule', '수리중': 'build', '수리완료': 'check_circle', '배송중': 'local_shipping', '수령완료': 'home' };
  return icons[s] || 'help';
};

const formatDate = (d) => d ? d.substring(0, 10) : '';
</script>

<style scoped>
.repair-item-card { border-radius: 16px; transition: all 0.3s ease; border: 1px solid #e0e4e8; }
.repair-item-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; border-color: #bbdefb; }
.delivery-box { border: 1px dashed #c5cae9; border-radius: 8px; }
.border-dashed { border: 2.5px dashed #e0e0e0; border-radius: 16px; }
</style>