<template>
  <q-card flat bordered class="shadow-2 bg-grey-1 q-mt-md">
    <q-card-section class="q-pb-none">
      <div class="text-h6 text-weight-bolder text-teal-8">
        <q-icon name="desktop_windows" size="sm" class="q-mr-xs" /> 내 PC 견적 및 배송 현황
      </div>
    </q-card-section>
    
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-gears color="teal" size="50px" />
      <div class="q-mt-md text-grey-7">견적 내역을 불러오는 중입니다...</div>
    </div>

    <div v-else-if="estimates && estimates.length === 0" class="text-center q-pa-xl bg-white rounded-borders border-dashed">
      <q-icon name="assignment_late" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-5 q-mt-md">신청하신 견적 내역이 없습니다.</div>
    </div>

    <div v-else-if="estimates && estimates.length > 0" class="column q-gutter-y-md q-pa-md">
      <q-card v-for="estimate in estimates" :key="estimate.estimate_id" flat bordered class="estimate-item-card overflow-hidden bg-white shadow-1">
        <q-card-section class="q-pa-md">
          <div class="row items-start no-wrap">
            <div class="col">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-h6 text-weight-bold text-dark ellipsis" style="max-width: 70%;">
                  <span class="text-teal-7">[{{ estimate.usage }}]</span> 조립 PC 견적 요청
                </div>
                <q-badge outline :color="getStatusColor(estimate.status)" class="text-weight-bold q-px-sm" style="font-size: 13px;">
                  {{ estimate.status }}
                </q-badge>
              </div>

              <div class="row items-center q-gutter-x-sm q-mb-md text-grey-7">
                <span class="text-weight-bold text-teal-9">예산: {{ estimate.budget?.toLocaleString() }}만원</span>
                <q-separator vertical inset class="q-mx-xs" />
                <span>신청일: {{ formatDate(estimate.createdAt) }}</span>
              </div>

              <div v-if="estimate.description" class="q-mb-md q-pa-sm bg-grey-2 rounded-borders text-caption text-grey-9">
                <q-icon name="chat_bubble_outline" class="q-mr-xs" /> {{ estimate.description }}
              </div>
<div class="row q-col-gutter-x-sm">
  <div v-if="['견적발송완료', '배송중'].includes(estimate.status)" class="q-mb-md col-6">
    <q-btn 
      outline 
      color="secondary" 
      icon="picture_as_pdf" 
      label="견적서 (PDF)" 
      class="full-width"
      @click="viewPDF(estimate)"
    />
  </div>

  <div v-if="['견적발송완료'].includes(estimate.status)" class="q-mb-md col-6">
    <q-btn 
      outline 
      color="primary" 
      icon="credit_card" 
      label="결제하기" 
      class="full-width"
      @click="goToPayment(estimate)"
    />
  </div>
</div>
              <div v-if="estimate.tracking_number && String(estimate.tracking_number).trim() !== ''" class="delivery-box q-pa-sm rounded-borders bg-teal-1">
                <div class="row items-center justify-between">
                  <div class="column">
                    <span class="text-caption text-teal-9 text-weight-bold">
                      <q-icon name="local_shipping" size="16px" /> 
                      {{ getCompanyName(estimate.delivery_company) }}
                    </span>
                    <span class="text-body2 text-teal-8 text-weight-medium">송장번호: {{ estimate.tracking_number }}</span>
                  </div>
                  <q-btn 
                    color="teal-7" 
                    label="배송 조회" 
                    icon="search" 
                    unelevated 
                    size="sm" 
                    class="q-px-md shadow-1"
                    @click="openTracking(estimate)" 
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
import { useRouter } from 'vue-router';

const $q = useQuasar();
const userStore = useUserStore();
const router = useRouter();

const estimates = ref([]); 
const loading = ref(false);

const loadEstimates = async () => {
  if (!userStore.user?.id) return;
  loading.value = true;
  try {
    // 백엔드에 견적용 유저별 조회 API가 있어야 합니다 (아래 설명 참고)
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates/user/${userStore.user.id}`);
    if (res.data.success) {
      estimates.value = res.data.data || [];
    }
  } catch (err) {
    console.error(err);
    $q.notify({ color: 'negative', message: '견적 내역을 불러오지 못했습니다.' });
  } finally {
    loading.value = false;
  }
};

onMounted(loadEstimates);

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
        <div class="q-mb-sm" style="border-left: 2px solid #009688; padding-left: 10px;">
          <div class="text-bold text-teal">${d.kind}</div>
          <div class="text-caption">${d.timeString} | ${d.where}</div>
        </div>
      `).reverse().join('');

      $q.dialog({
        title: `<div class="text-teal text-bold">실시간 배송 상태</div>`,
        message: `<div class="q-mb-sm">상태: <b class="text-teal-9">${tracking.levelName}</b></div><div style="max-height: 250px; overflow-y: auto;">${history}</div>`,
        html: true, ok: { label: '닫기', color: 'teal', flat: true }
      });
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '조회 실패: 송장 정보가 올바르지 않습니다.' });
  } finally { $q.loading.hide(); }
};

const getCompanyName = (code) => {
  const companies = { '04': 'CJ대한통운', '01': '우체국택배', '05': '한진택배', '06': '로젠택배' };
  return companies[code] || `기타택배(${code})`;
};

const getStatusColor = (s) => {
  const colors = { '접수완료': 'blue-7', '견적발송중': 'orange-8', '견적발송완료': 'green-8', '배송중': 'teal-8', '배송완료': 'deep-purple-8' };
  return colors[s] || 'grey';
};

const formatDate = (d) => d ? d.substring(0, 10) : '';

const viewPDF = async (estimate) => {
  try {
    // 서버의 상세 정보 API를 호출하여 pdf_path를 가져옵니다.
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates/detail/${estimate.estimate_id}`);
    
    if (res.data.success && res.data.data.pdf_path) {
      const baseUrl = 'https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app';
      // 백슬래시를 슬래시로 변환하여 전체 URL 생성
      const fullUrl = `${baseUrl}/${res.data.data.pdf_path.replace(/\\/g, '/')}`;
      window.open(fullUrl, '_blank'); // 새 탭에서 PDF 열기
    } else {
      $q.notify({ 
        color: 'warning', 
        message: '아직 등록된 견적서 파일이 없습니다. 잠시만 기다려주세요.',
        icon: 'warning'
      });
    }
  } catch (err) {
    console.error('PDF 로드 에러:', err);
    $q.notify({ 
      color: 'negative', 
      message: '견적서 정보를 가져오는 중 오류가 발생했습니다.' 
    });
  }
};
const goToPayment = (estimate) => {
  if (!estimate || !estimate.estimate_id) {
    $q.notify({ color: 'negative', message: '견적 정보를 찾을 수 없습니다.' });
    return;
  }const finalPrice = estimate.real_price 
    ? Number(estimate.real_price) 
    : (Number(estimate.budget) * 10000);

  if (!finalPrice || finalPrice <= 0) {
    $q.notify({ color: 'warning', message: '확정된 결제 금액이 없습니다.' });
    return;
  }

  // 요구하신 모든 정보를 query 객체에 담습니다.
router.push({
    path: '/pay',
    query: {
      mode: 'ESTIMATE',
      estimateId: estimate.estimate_id,
      user_id: userStore.user?.id || '',
      total_price: finalPrice, 
      customer_name: estimate.customer_name || userStore.user?.name || '구매자',
      phone: estimate.contact || userStore.user?.phone || '01000000000',
      address: estimate.full_address || userStore.user?.address || '기본 배송지'
    }
  });
};
</script>

<style scoped>
.estimate-item-card { border-radius: 16px; transition: all 0.3s ease; border: 1px solid #e0e4e8; }
.estimate-item-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; border-color: #b2dfdb; }
.delivery-box { border: 1px dashed #80cbc4; border-radius: 8px; }
.border-dashed { border: 2.5px dashed #e0e0e0; border-radius: 16px; }
</style>