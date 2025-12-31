<template>
  <div v-if="orders.length === 0" class="text-center q-pa-xl bg-white rounded-borders shadow-1">
    <q-icon name="shopping_cart" size="64px" color="grey-4" />
    <div class="text-grey-6 q-mt-md">구매 내역이 없습니다.</div>
  </div>

  <q-card v-for="order in orders" :key="order.order_id" flat bordered class="q-mb-sm bg-white order-card">
    <q-card-section class="row items-center">
      <div class="col">
        <div class="row items-center q-gutter-x-sm">
          <q-badge :color="order.is_paid ? 'blue' : 'orange'">{{ order.is_paid ? '결제완료' : '미결제' }}</q-badge>
          <div class="text-subtitle1 text-weight-bold">{{ order.product_name }}</div>
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">송장번호: {{ order.tracking_number || '미발급' }}</div>
      </div>
      <div class="text-right">
        <div class="text-h6 text-primary">{{ order.total_price.toLocaleString() }}원</div>
        <q-btn v-if="order.tracking_number" label="배송조회" size="sm" color="secondary" outline @click="trackPackage(order.tracking_number)" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import axios from 'axios';

const userStore = useUserStore();
const orders = ref([]);

const loadOrders = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/orders/user/${userStore.user.id}`);
    orders.value = res.data.data;
  } catch (e) { console.error(e); }
};

const trackPackage = (num) => {
  window.open(`https://tracker.delivery/#/kr.cjlogistics/${num}`, '_blank');
};

onMounted(loadOrders);
</script>