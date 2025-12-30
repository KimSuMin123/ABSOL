<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold text-blue-9">주문 마스터 관리 (조립/배송)</div>
        <q-space />
        <q-btn color="grey-7" icon="refresh" label="새로고침" @click="loadOrders" flat />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-4">
          <q-input v-model="searchQuery" label="주문자/상품명 검색" dense outlined @keyup.enter="loadOrders">
            <template v-slot:append><q-icon name="search" @click="loadOrders" class="cursor-pointer" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-3">
          <q-select 
            v-model="selectedStatusFilter" 
            :options="['전체', '접수완료', '조립중', '조립완료', '상품출고', '배송중', '수령완료']" 
            label="진행 단계 필터" dense outlined @update:model-value="loadOrders"
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="order in orders" :key="order.order_id" class="col-12">
        <q-card flat bordered class="order-card shadow-1">
          <q-card-section horizontal>
            <div class="col-2 flex flex-center q-ma-sm rounded-borders" :class="getStatusBgColor(order.status)" style="max-width: 120px; height: 120px">
              <q-icon :name="getStatusIcon(order.status)" size="64px" :color="getStatusColor(order.status)" />
            </div>

            <q-card-section class="col-3 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge :color="getStatusColor(order.status)" class="q-mr-sm">{{ order.status }}</q-badge>
                <div class="text-h6 text-weight-bold ellipsis">{{ order.product_name }}</div>
              </div>
              <div class="text-subtitle2 text-primary">#{{ order.order_id }} | {{ order.customer_name }}</div>
              <div class="text-caption text-grey-7"><q-icon name="phone" size="xs" /> {{ order.phone }}</div>
            </q-card-section>
  <q-card-section class="col-2 q-py-md flex flex-center border-left">
              <div class="text-center">
                <div class="text-body2 text-weight-bold text-blue-9">{{ order.total_price?.toLocaleString() }}원</div>
                <div class="text-caption text-grey-6">{{ order.createdAt?.substring(0, 10) }}</div>
                <q-badge :color="order.is_paid ? 'green' : 'red'" outline class="q-mt-xs">
                  {{ order.is_paid ? '결제완료' : '미결제' }}
                </q-badge>
              </div>
            </q-card-section>
            <q-card-section class="col-5 q-py-md border-left  row q-col-gutter-sm items-center">
              <div class="col-6">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">단계 변경</div>
                <q-select
                  v-model="order.status"
                  :options="['접수완료', '조립중', '조립완료', '상품출고', '배송중', '수령완료']"
                  dense outlined bg-color="white"
                  @update:model-value="(val) => updateOrderData(order, { status: val })"
                />
              </div>
              <div class="col-6">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">운송장 번호</div>
                <q-input
                  v-model="order.tracking_number"
                  dense outlined bg-color="white"
                  placeholder="번호 입력 후 Enter"
                  @keyup.enter="updateOrderData(order, { tracking_number: order.tracking_number })"
                >
                  <template v-slot:append><q-icon name="save" size="xs" /></template>
                </q-input>
              </div>
            </q-card-section>

          
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-inner-loading :showing="loading"><q-spinner-grid size="50px" color="primary" /></q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const orders = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatusFilter = ref('전체');

const loadOrders = async () => {
  loading.value = true;
  try {
    const params = { search: searchQuery.value };
    if (selectedStatusFilter.value !== '전체') params.status = selectedStatusFilter.value;
    
    const res = await axios.get('http://localhost:3000/api/orders', { params });
    orders.value = res.data.data;
  } catch (error) {
    $q.notify({ color: 'negative', message: '데이터 로드 실패' });
  } finally {
    loading.value = false;
  }
};

const updateOrderData = async (order, payload) => {
  try {
    await axios.patch(`http://localhost:3000/api/orders/${order.order_id}`, payload);
    $q.notify({ color: 'positive', message: '업데이트 완료', timeout: 500 });
  } catch (error) {
    $q.notify({ color: 'negative', message: '업데이트 실패' });
    loadOrders();
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

onMounted(loadOrders);
</script>