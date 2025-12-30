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
              <q-btn 
                outline 
                color="primary" 
                label="장바구니 담기" 
                icon="shopping_cart" 
                class="full-width" 
                size="lg" 
                @click="addToCart"
              />
            </div>
            <div class="col-6">
              <q-btn color="primary" label="바로 구매하기" icon="bolt" class="full-width" size="lg" :disable="product.stock === 0" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // useRouter 추가
import axios from 'axios';
import { useQuasar } from 'quasar'; // Quasar Notify 알림용
import { useCartStore } from '../stores/cart'; // [포인트] Pinia 스토어 가져오기

const route = useRoute();
const router = useRouter(); // [포인트]
const $q = useQuasar(); // [포인트]
const cartStore = useCartStore(); // [포인트] 스토어 인스턴스

const product = ref({});
const loading = ref(false);

// [추가] 장바구니 담기 기능
const addToCart = () => {
  if (!product.value.product_id) return;

  // Pinia 스토어의 액션 호출
  cartStore.addToCart(product.value);

  // 사용자 피드백 알림
  $q.notify({
    type: 'positive',
    message: `${product.value.product_name} 상품이 장바구니에 담겼습니다.`,
    position: 'top',
    actions: [
      { label: '장바구니 보기', color: 'white', handler: () => router.push('/cart') }
    ]
  });
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