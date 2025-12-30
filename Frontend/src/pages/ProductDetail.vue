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
  <q-card style="min-width: 600px; min-height: 450px;">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">배송 정보 입력</div>
    </q-card-section>

    <q-card-section class="q-gutter-y-sm q-pt-md">
      <q-input dense outlined v-model="orderForm.customer_name" label="주문자 성함" autofocus />
      <q-input dense outlined v-model="orderForm.phone" label="연락처" mask="###-####-####" />

      <div class="row q-gutter-x-sm items-center no-wrap">
        <q-input 
          dense outlined 
          v-model="orderForm.postcode" 
          label="우편번호" 
          readonly 
          class="col-4" 
        />
        <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline class="col-auto" />
      </div>

      <q-input 
        dense outlined 
        v-model="orderForm.address" 
        label="기본 배송지 주소" 
        readonly 
        hint="주소 검색을 완료해 주세요." 
      />

      <q-input 
        dense outlined 
        v-model="orderForm.detailAddress" 
        label="상세 주소" 
        placeholder="동, 호수 등을 입력하세요" 
        ref="detailInput"
      />
    </q-card-section>

    <q-card-actions class="q-pb-xl q-pr-md">
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
const submitting = ref(false); // 결제 중 로딩 상태 추가

// 구매 관련 상태 (중복 선언 제거)
const purchaseDialog = ref(false);
const detailInput = ref(null);
const orderForm = ref({
  customer_name: '',
  phone: '',
  postcode: '',
  address: '',
  detailAddress: ''
});

// 다이얼로그 열기
const openPurchaseDialog = () => {
  purchaseDialog.value = true;
};

// [추가] 카카오 주소 검색 로직
const openPostcode = () => {
  if (!window.daum) {
    $q.notify({ color: 'negative', message: '주소 서비스 라이브러리가 로드되지 않았습니다.' });
    return;
  }
  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      orderForm.value.postcode = data.zonecode;
      orderForm.value.address = fullAddr;
      // 주소 선택 후 상세주소 칸으로 포커스 이동
      setTimeout(() => {
        if (detailInput.value) detailInput.value.focus();
      }, 100);
    }
  }).open();
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

// [수정] 실제 구매 프로세스 (주소 합치기 로직 포함)
const processPurchase = async () => {
  if (!orderForm.value.customer_name || !orderForm.value.phone || !orderForm.value.address) {
    $q.notify({ color: 'negative', message: '모든 배송 정보를 정확히 입력해주세요.' });
    return;
  }

  submitting.value = true;
  try {
    // 백엔드 저장을 위해 상세 주소까지 하나로 합침
    const fullAddress = `(${orderForm.value.postcode}) ${orderForm.value.address} ${orderForm.value.detailAddress}`;

    const res = await axios.post('http://localhost:3000/api/orders/direct', {
      product_id: product.value.product_id,
      product_name: product.value.product_name,
      customer_name: orderForm.value.customer_name,
      phone: orderForm.value.phone,
      address: fullAddress, // 합쳐진 주소 전송
      total_price: product.value.product_price,
      status: '접수완료'
    });

    if (res.data.success) {
      $q.notify({ color: 'positive', message: '주문 및 결제가 완료되었습니다!' });
      purchaseDialog.value = false;
      // 폼 초기화
      orderForm.value = { customer_name: '', phone: '', postcode: '', address: '', detailAddress: '' };
      // 재고 업데이트를 위해 데이터 리로드
      loadProductDetail();
    }
  } catch (error) {
    $q.notify({ 
      color: 'negative', 
      message: error.response?.data?.message || '주문 처리 중 오류가 발생했습니다.' 
    });
  } finally {
    submitting.value = false;
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