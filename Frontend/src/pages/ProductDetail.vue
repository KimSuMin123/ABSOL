<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1000px;">
      <q-btn flat icon="arrow_back" label="목록으로 돌아가기" color="grey-8" @click="$router.back()" class="q-mb-md" />

      <q-card flat bordered class="row no-wrap shadow-2 rounded-borders overflow-hidden">
        <div class="col-12 col-md-6 bg-white flex flex-center">
          <q-img
            :src="product.image_url ? `http://localhost:3000${product.image_url}` : 'https://cdn.quasar.dev/img/no-image.png'"
            style="max-width: 100%; height: auto;"
            class="q-ma-md"
          />
        </div>

        <q-card-section class="col-12 col-md-6 q-pa-xl bg-white border-left">
          <div class="row items-center q-gutter-x-sm q-mb-md">
            <q-badge :color="product.is_used ? 'orange-9' : 'teal-7'" class="q-pa-xs">
              {{ product.is_used ? '중고 상품' : '새 상품' }}
            </q-badge>
            <q-badge v-if="product.stock > 0" color="blue-6">재고 보유</q-badge>
            <q-badge v-else color="red-6">품절</q-badge>
          </div>

          <div class="text-h4 text-weight-bolder q-mb-sm">{{ product.product_name }}</div>
          <div class="text-h5 text-primary text-weight-bold q-mb-lg">
            {{ product.product_price?.toLocaleString() }}원
          </div>

          <q-separator q-my-lg />

          <div class="q-mb-xl">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">하드웨어 상세 사양</div>
            <div class="bg-grey-2 q-pa-md rounded-borders text-body1" style="white-space: pre-line;">
              {{ product.hardware_info || '등록된 사양 정보가 없습니다.' }}
            </div>
          </div>

          <div class="q-mb-xl">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">상품 설명</div>
            <div class="text-body2 text-grey-8">
              {{ product.description || '상품 상세 설명이 없습니다.' }}
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn outline color="primary" label="장바구니 담기" icon="shopping_cart" class="full-width" size="lg" @click="addToCart" />
            </div>
            <div class="col-6">
              <q-btn color="primary" label="바로 구매하기" icon="bolt" class="full-width" size="lg" :disable="product.stock === 0" @click="openPurchaseDialog" />
              
              <q-dialog v-model="purchaseDialog">
                <q-card style="min-width: 350px">
                  <q-card-section class="bg-primary text-white">
                    <div class="text-h6">배송 정보 입력</div>
                  </q-card-section>

                  <q-card-section class="q-gutter-y-sm q-pt-md">
                    <q-input dense outlined v-model="orderForm.customer_name" label="주문자 성함" autofocus />
                    <q-input dense outlined v-model="orderForm.phone" label="연락처" />
                    <q-input dense outlined v-model="orderForm.address" label="배송지 주소" />
                  </q-card-section>

                  <q-card-actions align="right" class="q-pb-md q-pr-md">
                    <q-btn flat label="취소" v-close-popup />
                    <q-btn color="primary" label="결제하기" @click="processPurchase" />
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const cartStore = useCartStore();

const product = ref({});
const loading = ref(false);

// [추가] 구매 관련 상태 변수
const purchaseDialog = ref(false);
const orderForm = ref({
  customer_name: '',
  phone: '',
  address: ''
});

// 다이얼로그 열기
const openPurchaseDialog = () => {
  purchaseDialog.value = true;
};

// 장바구니 담기
const addToCart = () => {
  if (!product.value.product_id) return;
  cartStore.addToCart(product.value);
  $q.notify({
    type: 'positive',
    message: `${product.value.product_name} 상품이 장바구니에 담겼습니다.`,
    position: 'top',
    actions: [{ label: '장바구니 보기', color: 'white', handler: () => router.push('/cart') }]
  });
};

// [추가] 실제 구매 프로세스 (재고 차감 및 주문 기록)
const processPurchase = async () => {
  if (!orderForm.value.customer_name || !orderForm.value.phone || !orderForm.value.address) {
    $q.notify({ color: 'negative', message: '모든 배송 정보를 입력해주세요.' });
    return;
  }

  try {
    const res = await axios.post('http://localhost:3000/api/orders/direct', {
      product_id: product.value.product_id,
      product_name: product.value.product_name, // 주문 당시 상품명 저장
      customer_name: orderForm.value.customer_name,
      phone: orderForm.value.phone,
      address: orderForm.value.address,
      total_price: product.value.product_price
    });

    if (res.data.success) {
      $q.notify({ color: 'positive', message: '주문 및 결제가 완료되었습니다!' });
      purchaseDialog.value = false;
      
      // 재고 수량 업데이트를 위해 데이터를 다시 불러옴
      loadProductDetail();
    }
  } catch (error) {
    $q.notify({ 
      color: 'negative', 
      message: error.response?.data?.message || '주문 처리 중 오류가 발생했습니다.' 
    });
  }
};

const loadProductDetail = async () => {
  loading.value = true;
  try {
    const productId = route.params.id;
    const res = await axios.get(`http://localhost:3000/api/products/${productId}`);
    if (res.data.success) {
      product.value = res.data.data;
    }
  } catch (error) {
    console.error('상품 상세 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadProductDetail);
</script>

<style scoped>
.border-left { border-left: 1px solid #f2f2f2; }
@media (max-width: 1023px) {
  .border-left { border-left: none; border-top: 1px solid #f2f2f2; }
}
</style>