<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1000px;">
      <q-btn flat icon="arrow_back" label="목록으로 돌아가기" color="grey-8" @click="$router.back()" class="q-mb-md" />

      <q-card flat bordered class="row no-wrap shadow-2 rounded-borders overflow-hidden">
        <div class="col-12 col-md-6 bg-white flex flex-center">
          <q-img
            :src="product.image_url ? `http://svc.sel3.cloudtype.app:30209${product.image_url}` : 'https://cdn.quasar.dev/img/no-image.png'"
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

          <q-separator class="q-my-lg" />

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
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="purchaseDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px;">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">배송 정보 입력</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md q-pt-lg">
          <q-input dense outlined v-model="orderForm.customer_name" label="주문자 성함" />
          <q-input dense outlined v-model="orderForm.phone" label="연락처" mask="###-####-####" />

          <div class="row q-gutter-x-sm items-center no-wrap">
            <q-input dense outlined v-model="orderForm.postcode" label="우편번호" readonly class="col-4" />
            <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline class="col-auto" />
          </div>

          <q-input dense outlined v-model="orderForm.address" label="기본 배송지 주소" readonly hint="주소 검색을 완료해 주세요." />
          <q-input dense outlined v-model="orderForm.detailAddress" label="상세 주소" placeholder="동, 호수 등을 입력하세요" ref="detailInput" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="취소" v-close-popup color="grey-7" />
           <q-btn 
  color="primary" 
  label="주문하기" 
  class="full-width q-mt-md" 
  size="lg" 
  @click=goToPayment
/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useCartStore } from '../stores/cart';
import { useUserStore } from '../stores/user'; // 유저 정보 스토어 가져오기

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const cartStore = useCartStore();
const userStore = useUserStore(); // Pinia 유저 스토어 사용

const product = ref({});
const loading = ref(false);
const submitting = ref(false);

const purchaseDialog = ref(false);
const detailInput = ref(null);

// 주문 폼: 초기값을 userStore에서 가져와 자동 입력 구현
const orderForm = ref({
  customer_name: '',
  phone: '',
  postcode: '',
  address: '',
  detailAddress: ''
});

// 다이얼로그 열 때 로그인 정보를 폼에 채워넣음
const openPurchaseDialog = () => {
  if (userStore.user) {
    orderForm.value.customer_name = userStore.user.name || '';
    orderForm.value.phone = userStore.user.phone || '';
    // 주소 정보가 유저 정보에 있다면 추가
    orderForm.value.postcode = userStore.user.postcode || '';
    orderForm.value.address = userStore.user.address || '';
    orderForm.value.detailAddress = userStore.user.detailAddress || '';
  }
  purchaseDialog.value = true;
};

// 카카오 주소 검색
const openPostcode = () => {
  if (!window.daum) {
    $q.notify({ color: 'negative', message: '주소 서비스 라이브러리를 불러올 수 없습니다.' });
    return;
  }
  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      orderForm.value.postcode = data.zonecode;
      orderForm.value.address = fullAddr;
      setTimeout(() => {
        if (detailInput.value) detailInput.value.focus();
      }, 100);
    }
  }).open();
};

const addToCart = () => {
  if (!product.value.product_id) return;
  cartStore.addToCart(product.value);
  $q.notify({
    type: 'positive',
    message: `${product.value.product_name}이(가) 장바구니에 담겼습니다.`,
    position: 'top',
    actions: [{ label: '장바구니 보기', color: 'white', handler: () => router.push('/cart') }]
  });
};

const processPurchase = async () => {
  if (!orderForm.value.customer_name || !orderForm.value.phone || !orderForm.value.address) {
    $q.notify({ color: 'negative', message: '배송 정보를 모두 입력해주세요.' });
    return;
  }

  submitting.value = true;
  try {
    const fullAddress = `(${orderForm.value.postcode}) ${orderForm.value.address} ${orderForm.value.detailAddress}`;

    // 주문 생성 시 user_id를 함께 전송 (마이페이지 연동의 핵심)
    const res = await axios.post('http://svc.sel3.cloudtype.app:30209/api/orders/direct', {
      user_id: userStore.user?.id || null, // 로그인 안한 경우 대비
      product_id: product.value.product_id,
      product_name: product.value.product_name,
      customer_name: orderForm.value.customer_name,
      phone: orderForm.value.phone,
      address: fullAddress,
      total_price: product.value.product_price,
      status: '접수완료'
    });

    if (res.data.success) {
      $q.notify({ color: 'positive', message: '주문이 성공적으로 완료되었습니다.' });
      purchaseDialog.value = false;
      loadProductDetail(); // 재고 업데이트 반영을 위해 새로고침
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '주문 처리 중 오류가 발생했습니다.' });
  } finally {
    submitting.value = false;
  }
};
const goToPayment = () => {
if (!orderForm.value.customer_name || !orderForm.value.phone || !orderForm.value.address) {
    $q.notify({ color: 'negative', message: '배송 정보를 모두 입력해주세요.' });
    return;
  }

  // 에러 발생 지점 수정: setDirectOrder -> setPendingOrder (스토어 함수명과 일치)
  cartStore.setPendingOrder({
    product_id: product.value.product_id,
    product_name: product.value.product_name,
    product_price: product.value.product_price,
    customer_name: orderForm.value.customer_name,
    phone: orderForm.value.phone,
    address: `(${orderForm.value.postcode}) ${orderForm.value.address} ${orderForm.value.detailAddress}`
  });

  // 결제 페이지로 이동
  router.push({ path: '/pay', query: { mode: 'direct' } });
};
const loadProductDetail = async () => {
  loading.value = true;
  try {
    const productId = route.params.id;
    const res = await axios.get(`http://svc.sel3.cloudtype.app:30209/api/products/${productId}`);
    if (res.data.success) {
      product.value = res.data.data;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '상품 정보를 불러오지 못했습니다.' });
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