<template>
  <q-card flat bordered class="shadow-2 bg-grey-1 q-mt-md">
    <q-card-section class="q-pb-none">
      <div class="text-h6 text-weight-bolder text-primary">
        <q-icon name="shopping_cart" size="sm" class="q-mr-xs" /> 최근 주문 현황
      </div>
    </q-card-section>

    <q-card-section class="q-pa-md">
      <div v-if="orders.length > 0" class="column q-gutter-y-md">
        <q-card v-for="order in orders" :key="order.order_id" flat bordered class="order-item-card overflow-hidden bg-white">
          <q-card-section class="q-pa-md">
            <div class="row items-start no-wrap">
           
              <div class="col">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-h6 text-weight-bold text-dark ellipsis" style="max-width: 70%;">
                    {{ order.product_name || 'PC 조립/수리 서비스' }}
                  </div>
        
                </div>

                <div class="row items-center q-gutter-x-sm q-mb-md">
                  <div class="text-h5 text-weight-bolder text-primary">
                    {{ (order.total_price || 0).toLocaleString() }}원
                  </div>
                  <q-badge outline :color="getStatusColor(order.status)" class="text-weight-bold" style="font-size: 14px; padding: 4px 8px;">
                    {{ order.status }}
                  </q-badge>
                </div>

                <div v-if="order.status === '배송중' && order.tracking_number" class="delivery-box q-pa-sm rounded-borders bg-indigo-1">
                  <div class="row items-center justify-between">
                    <div class="column">
                      <span class="text-caption text-indigo-9 text-weight-bold">
                        <q-icon name="local_shipping" size="16px" /> {{ getCompanyName(order.delivery_company) }}
                      </span>
                      <span class="text-body2 text-indigo-8 text-weight-medium">송장: {{ order.tracking_number }}</span>
                    </div>
                    <q-btn 
                      color="indigo-7" 
                      label="배송 상세 조회" 
                      icon="search" 
                      unelevated 
                      size="sm" 
                      class="q-px-md"
                      @click="openTracking(order)" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-else class="text-center q-pa-xl text-grey-5 bg-white rounded-borders border-dashed">
        <q-icon name="inbox" size="64px" class="q-mb-sm" />
        <div class="text-h6">진행 중인 주문 내역이 없습니다.</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.order-item-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.order-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}
.delivery-box {
  border: 1px dashed #c5cae9;
}
.text-h6 { font-size: 1.15rem; line-height: 1.3; }
.text-h5 { font-size: 1.4rem; }
.border-dashed { border: 2px dashed #e0e0e0; }
</style>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const $q = useQuasar();
const orders = ref([]);
const getCompanyName = (code) => {
  const companies = {
    '01': '우체국택배',
    '04': 'CJ대한통운',
    '05': '한진택배',
    '06': '로젠택배',
    '08': '롯데택배',
    '11': '일양로지스',
    '23': '경동택배',
    '24': '천일택배',
    '32': '용마로지스',
    '46': 'CU 편의점택배',
    '53': '우체국 EMS',
    '10': 'GTX로지스'
  };
  return companies[code] || `기타택배(${code})`;
};
const openTracking = async (order) => {
  $q.loading.show({ message: '배송 정보를 가져오는 중...' });
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/delivery/track`, {
      params: { 
        t_code: order.delivery_company, 
        t_invoice: order.tracking_number 
      }
    });

    if (res.data.success) {
      const tracking = res.data.data;
      const history = tracking.trackingDetails.map(item => `
        <div class="q-mb-sm" style="border-left: 2px solid #3f51b5; padding-left: 10px;">
          <div class="text-bold text-primary">${item.kind}</div>
          <div class="text-caption">${item.timeString} | ${item.where}</div>
        </div>
      `).reverse().join('');

      $q.dialog({
        title: `<div class="text-primary text-bold">실시간 배송 조회</div>`,
        message: `
          <div class="q-mb-md">택배사: <b>${getCompanyName(order.delivery_company)}</b></div>
          <div class="q-mb-md">현재 상태: <b class="text-indigo">${tracking.levelName || order.status}</b></div>
          <div style="max-height: 300px; overflow-y: auto;">${history}</div>
        `,
        html: true,
        ok: { label: '닫기', color: 'primary', flat: true }
      });
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '조회 실패: 운송장 번호를 확인해주세요.' });
  } finally {
    $q.loading.hide();
  }
};


const getStatusColor = (status) => {
  const colors = { '접수완료': 'grey-7', '조립중': 'orange-8', '조립완료': 'blue-8', '상품출고': 'indigo-8', '배송중': 'green-8', '수령완료': 'purple-8' };
  return colors[status] || 'grey';
};

const getStatusBgColor = (status) => {
  const bgs = { '접수완료': 'bg-grey-2', '조립중': 'bg-orange-1', '조립완료': 'bg-blue-1', '상품출고': 'bg-indigo-1', '배송중': 'bg-green-1', '수령완료': 'bg-purple-1' };
  return bgs[status] || 'bg-grey-1';
};

const getStatusIcon = (status) => {
  const icons = { '접수완료': 'assignment', '조립중': 'build', '조립완료': 'check_circle', '상품출고': 'outbox', '배송중': 'local_shipping', '수령완료': 'home' };
  return icons[status] || 'help';
};

const loadOrders = async () => {
  if (!userStore.user?.id) return;
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/orders/user/${userStore.user.id}`);
    orders.value = res.data.data;
  } catch (e) {
    console.error('주문 로드 실패:', e);
  }
};

onMounted(loadOrders);
</script>