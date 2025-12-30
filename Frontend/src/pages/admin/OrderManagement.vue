<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">
          <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
          <span class="q-ml-sm text-subtitle1 text-weight-bold text-grey-8">주문 마스터 관리</span>
        </div>
        <q-space />
        <q-btn color="grey-7" icon="refresh" label="새로고침" @click="loadOrders" flat />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-4">
          <q-input v-model="searchQuery" label="주문자/상품명 검색" dense outlined @keyup.enter="loadOrders">
            <template v-slot:append>
              <q-icon name="search" class="cursor-pointer" @click="loadOrders" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-3">
          <q-select 
            v-model="selectedStatus" 
            :options="['전체', '결제완료', '입금대기']" 
            label="주문 상태 필터" 
            dense outlined 
            @update:model-value="loadOrders"
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="orders.length === 0 && !loading" class="col-12 text-center q-pa-xl text-grey-6 bg-white shadow-1 rounded-borders">
        조회된 주문 내역이 없습니다.
      </div>

      <div v-for="order in orders" :key="order.order_id" class="col-12">
        <q-card flat bordered class="order-card shadow-1">
          <q-card-section horizontal>
            <div class="col-2 flex flex-center q-ma-sm rounded-borders" 
                 :class="order.is_paid ? 'bg-blue-1' : 'bg-amber-1'" 
                 style="max-width: 120px; height: 120px">
              <q-icon :name="order.is_paid ? 'local_shipping' : 'pending_actions'" size="64px" :color="order.is_paid ? 'blue-7' : 'amber-9'" />
            </div>

            <q-card-section class="col-4 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge :color="order.is_paid ? 'blue-7' : 'amber-9'" class="q-mr-sm">
                  {{ order.is_paid ? '결제완료' : '입금대기' }}
                </q-badge>
                <div class="text-h6 text-weight-bold ellipsis">{{ order.product_name }}</div>
              </div>
              <div class="text-subtitle2 text-primary">주문번호: #{{ order.order_id }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">
                <q-icon name="person" size="xs" /> {{ order.customer_name }} | <q-icon name="phone" size="xs" /> {{ order.phone }}
              </div>
            </q-card-section>

            <q-card-section class="col-4 q-py-md border-left">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">결제 및 배송 정보</div>
              <div class="text-body2 text-weight-bold text-blue-9">결제금액: {{ order.total_price?.toLocaleString() }}원</div>
              <div class="text-caption text-grey-7 q-mt-sm ellipsis-2-lines">
                <q-icon name="location_on" size="xs" /> {{ order.address || '주소 정보 없음' }}
              </div>
              <div v-if="order.tracking_number" class="text-caption text-green-7 q-mt-xs text-weight-bold">
                <q-icon name="inventory_2" size="xs" /> 배송: {{ order.tracking_number }}
              </div>
            </q-card-section>

            <q-card-section class="col-2 q-py-md flex flex-center border-left bg-grey-1">
              <div class="text-center full-width">
                <div class="text-caption text-grey-7">주문일자</div>
                <div class="text-weight-bold text-blue-grey-9 q-mb-sm">
                  {{ order.createdAt ? order.createdAt.substring(0, 10) : '-' }}
                </div>
                <q-btn 
                  color="primary" 
                  label="운송장 관리" 
                  icon="edit" 
                  dense 
                  unelevated
                  class="q-px-md" 
                  @click="openTrackingDialog(order)" 
                />
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="trackingDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">배송 정보 등록</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="q-mb-md text-subtitle2">
            주문번호 #{{ selectedOrder?.order_id }} - {{ selectedOrder?.customer_name }} 고객님
          </div>
          <q-input 
            v-model="trackingNumber" 
            label="운송장 번호를 입력하세요" 
            outlined 
            dense 
            autofocus 
            @keyup.enter="updateTracking"
            placeholder="예: CJ대한통운 12345678"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="취소" v-close-popup color="grey-7" />
          <q-btn outline color="orange-9" label="직접 배송(완료)" @click="handleDirectDelivery" />
          <q-btn color="primary" label="저장하기" @click="updateTracking" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="loading">
      <q-spinner-grid size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// 상태 변수
const orders = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('전체');

// 다이얼로그 관련 변수
const trackingDialog = ref(false);
const selectedOrder = ref(null);
const trackingNumber = ref('');

// 주문 목록 데이터 로드 (필터 포함)
const loadOrders = async () => {
  loading.value = true;
  try {
    const params = {};
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedStatus.value !== '전체') {
      params.is_paid = selectedStatus.value === '결제완료';
    }

    // 404 방지를 위해 백엔드 경로 http://localhost:3000/api/orders 확인
    const res = await axios.get('http://localhost:3000/api/orders', { params });
    if (res.data.success) {
      orders.value = res.data.data;
    }
  } catch (error) {
    console.error(error);
    $q.notify({ color: 'negative', message: '데이터를 불러오는 데 실패했습니다.' });
  } finally {
    loading.value = false;
  }
};

// 운송장 다이얼로그 열기
const openTrackingDialog = (order) => {
  selectedOrder.value = order;
  trackingNumber.value = order.tracking_number || '';
  trackingDialog.value = true;
};

// 운송장 번호 업데이트 (PATCH 요청)
const updateTracking = async () => {
  if (!selectedOrder.value) return;

  try {
    // 백엔드 라우터 router.patch('/:id')와 매칭
    const res = await axios.patch(`http://localhost:3000/api/orders/${selectedOrder.value.order_id}`, {
      tracking_number: trackingNumber.value
    });

    if (res.data.success) {
      $q.notify({ color: 'positive', message: '배송 정보가 저장되었습니다.' });
      trackingDialog.value = false;
      loadOrders(); // 목록 새로고침
    }
  } catch (error) {
    console.error(error);
    $q.notify({ color: 'negative', message: '업데이트 중 오류가 발생했습니다.' });
  }
};

// 직접 배송 완료 처리 (운송장 번호 대신 문구 삽입)
const handleDirectDelivery = async () => {
  trackingNumber.value = '직접배송(완료)';
  await updateTracking();
};

onMounted(loadOrders);
</script>

<style scoped>
.order-card {
  transition: all 0.2s ease-in-out;
  border-radius: 12px;
}
.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
}
.border-left {
  border-left: 1px solid #eeeeee;
}
/* 모바일 대응: 카드 내 섹션 구분선 위치 변경 */
@media (max-width: 600px) {
  .border-left {
    border-left: none;
    border-top: 1px solid #eeeeee;
  }
}
</style>