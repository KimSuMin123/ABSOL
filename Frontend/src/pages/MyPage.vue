<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 900px;">
      <div class="bg-white q-pa-lg shadow-1 rounded-borders q-mb-lg row items-center">
        <q-avatar size="70px" color="blue-1" text-color="blue-7" icon="person" class="q-mr-md" />
        <div>
          <div class="text-h5 text-weight-bolder">{{ user?.name }}님, 안녕하세요!</div>
          <div class="text-caption text-grey-7">등급: {{ user?.level }}</div>
        </div>
      </div>

      <div class="text-h6 text-weight-bold q-mb-md"><q-icon name="list_alt" /> 내 주문 내역</div>

      <div v-if="orders.length === 0" class="bg-white q-pa-xl text-center rounded-borders shadow-1">
        <q-icon name="shopping_basket" size="64px" color="grey-4" />
        <div class="text-grey-6 q-mt-md">주문하신 내역이 없습니다.</div>
        <q-btn color="primary" label="쇼핑하러 가기" to="/order" class="q-mt-md" flat />
      </div>

      <div v-else class="q-gutter-y-sm">
        <q-card v-for="order in orders" :key="order.order_id" flat bordered class="order-card">
          <q-card-section horizontal>
            <q-card-section class="col-8">
              <div class="row items-center q-mb-xs">
                <q-badge :color="order.is_paid ? 'blue-7' : 'amber-9'" class="q-mr-sm">
                  {{ order.is_paid ? '결제완료' : '입금대기' }}
                </q-badge>
                <div class="text-subtitle1 text-weight-bold">{{ order.product_name }}</div>
              </div>
              <div class="text-caption text-grey-7">주문일: {{ order.createdAt.substring(0, 10) }}</div>
              <div class="text-h6 text-primary q-mt-sm">{{ order.total_price.toLocaleString() }}원</div>
            </q-card-section>

            <q-card-section class="col-4 border-left bg-grey-1 flex flex-center">
              <div v-if="order.tracking_number" class="text-center">
                <div class="text-caption text-weight-bold text-green-7">배송중</div>
                <div class="text-caption">{{ order.tracking_number }}</div>
              </div>
              <div v-else class="text-caption text-grey-6 text-center">
                배송 준비 중
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const user = JSON.parse(localStorage.getItem('user') || '{}');
const orders = ref([]);

const loadMyOrders = async () => {
  try {
    // 백엔드에서 구현한 사용자별 조회 API 호출 (전화번호 기준)
    const res = await axios.get(`http://localhost:3000/api/orders/customer/${user.phone}`);
    if (res.data.success) {
      orders.value = res.data.data;
    }
  } catch (error) {
    console.error('내 주문 조회 실패:', error);
  }
};

onMounted(loadMyOrders);
</script>

<style scoped>
.order-card {
  border-radius: 12px;
  transition: transform 0.2s;
}
.order-card:hover {
  transform: translateY(-2px);
}
.border-left {
  border-left: 1px solid #eeeeee;
}
</style>