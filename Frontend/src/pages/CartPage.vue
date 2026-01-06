<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px;">
      <div class="text-h5 text-weight-bolder q-mb-lg">내 장바구니 ({{ cartStore.totalCount }})</div>

      <div v-if="cartStore.items.length === 0" class="text-center q-pa-xl bg-white rounded-borders shadow-1">
        <q-icon name="shopping_cart" size="100px" color="grey-4" />
        <div class="text-h6 text-grey-5 q-mt-md">장바구니가 비어 있습니다.</div>
        <q-btn label="쇼핑하러 가기" color="primary" class="q-mt-md" to="/order" />
      </div>

      <div v-else>
        <q-card v-for="item in cartStore.items" :key="item.product_id" flat bordered class="q-mb-sm bg-white">
          <q-card-section horizontal class="items-center">
            <q-img :src="item.image_url ? `http://svc.sel3.cloudtype.app:30209${item.image_url}` : 'https://cdn.quasar.dev/img/no-image.png'" style="width: 80px; height: 80px" class="q-ma-sm rounded-borders" />
            
            <q-card-section class="col">
              <div class="text-subtitle1 text-weight-bold">{{ item.product_name }}</div>
              <div class="text-primary text-weight-bold">{{ item.product_price.toLocaleString() }}원</div>
            </q-card-section>

            <q-card-section class="row items-center q-gutter-x-sm">
              <q-btn icon="remove" size="sm" flat round @click="cartStore.updateQuantity(item.product_id, item.quantity - 1)" />
              <div class="text-subtitle1">{{ item.quantity }}</div>
              <q-btn icon="add" size="sm" flat round @click="cartStore.updateQuantity(item.product_id, item.quantity + 1)" />
              <q-btn icon="delete" color="red" flat round @click="cartStore.removeFromCart(item.product_id)" />
            </q-card-section>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-lg bg-white q-pa-md">
          <div class="row justify-between items-center">
            <div class="text-h6">총 결제 금액</div>
            <div class="text-h5 text-primary text-weight-bolder">{{ cartStore.totalPrice.toLocaleString() }}원</div>
          </div>
          <q-btn color="primary" label="주문하기" class="full-width q-mt-md" size="lg" @click="openAddressDialog" />
        </q-card>
      </div>
    </div>

    <q-dialog v-model="addressDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">배송 정보 입력</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-sm q-pt-md">
          <q-input dense outlined v-model="orderForm.customer_name" label="수령인 성함" />
          <q-input dense outlined v-model="orderForm.phone" label="연락처" mask="###-####-####" />
          <div class="row q-gutter-x-xs no-wrap">
            <q-input dense outlined v-model="orderForm.postcode" label="우편번호" readonly class="col" />
            <q-btn label="찾기" color="secondary" @click="openPostcode" outline />
          </div>
          <q-input dense outlined v-model="orderForm.address" label="기본 주소" readonly />
          <q-input dense outlined v-model="orderForm.detailAddress" label="상세 주소" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="grey" v-close-popup />
          <q-btn label="결제하러 가기" color="primary" @click="goToPayment" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '../stores/cart';
import { useUserStore } from '../stores/user'; // 유저 스토어 추가
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const cartStore = useCartStore();
const userStore = useUserStore();
const router = useRouter();
const $q = useQuasar();

const addressDialog = ref(false);

const orderForm = ref({
  customer_name: '',
  phone: '',
  postcode: '',
  address: '',
  detailAddress: ''
});

// 주문하기 버튼 클릭 시 다이얼로그 오픈
const openAddressDialog = () => {
  // 로그인 정보가 있다면 기본값으로 채워줌
  if (userStore.user) {
    orderForm.value.customer_name = userStore.user.name || '';
    orderForm.value.phone = userStore.user.phone || '';
    orderForm.value.postcode = userStore.user.postcode || '';
    orderForm.value.address = userStore.user.address || '';
    orderForm.value.detailAddress = userStore.user.detailAddress || '';
  }
  addressDialog.value = true;
};

// 카카오 주소 검색 함수 통합
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
    }
  }).open();
};

const goToPayment = () => {
  if (!orderForm.value.customer_name || !orderForm.value.phone || !orderForm.value.address) {
    $q.notify({ color: 'negative', message: '배송 정보를 모두 입력해주세요.' });
    return;
  }

  // 모든 상품명과 수량을 나열 (예: "AMD 라이젠5 1개, 삼성 DDR5 16G 2개")
  const productSummary = cartStore.items
    .map(item => `${item.product_name} ${item.quantity}개`)
    .join(', ');

  // 배송 정보 및 상세 상품 정보 저장
  cartStore.setPendingOrder({
    customer_name: orderForm.value.customer_name,
    phone: orderForm.value.phone,
    address: `(${orderForm.value.postcode}) ${orderForm.value.address} ${orderForm.value.detailAddress}`,
    product_name: productSummary, // 나열된 상품명 전달
    total_amount: cartStore.totalPrice
  });

  // 결제 페이지로 이동
  router.push({ path: '/pay' }); 
};
</script>