<template>
  <q-page class="bg-grey-1 q-pa-md flex flex-center">
    <div class="payment-container bg-white q-pa-lg shadow-2 rounded-borders">
      <div class="text-h5 text-bold q-mb-md">결제하기</div>
      
      <q-list bordered separator class="rounded-borders q-mb-lg">
        <q-item>
          <q-item-section>
            <q-item-label caption>주문 상품</q-item-label>
            <q-item-label class="text-weight-bold">{{ orderTitle }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>총 결제 금액</q-item-label>
            <q-item-label class="text-h6 text-primary text-weight-bolder">
              {{ totalAmount.toLocaleString() }}원
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div id="payment-method"></div>
      <div id="agreement"></div>

      <q-btn 
        label="결제하기" 
        color="primary" 
        size="lg" 
        class="full-width q-mt-md" 
        :loading="isProcessing"
        @click="handlePayment" 
      />
      <q-btn 
        flat 
        label="취소하고 돌아가기" 
        color="grey-7" 
        class="full-width q-mt-sm" 
        @click="$router.back()" 
      />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user' // 유저 스토어 가정
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const cartStore = useCartStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 상태 관리
const widgets = ref(null)
const isProcessing = ref(false)

// 토스페이먼츠 설정값
const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
const customerKey = 'USER_' + Math.random().toString(36).slice(2, 11) 

// [변경] 바로 구매 모드인지 확인
const isDirect = computed(() => route.query.mode === 'direct')

// [변경] 주문 명칭 계산 (바로구매 데이터 우선)
const orderTitle = computed(() => {
  if (isDirect.value && cartStore.pendingOrder) {
    return cartStore.pendingOrder.product_name
  }
  
  if (cartStore.items.length === 0) return '상품 정보 없음'
  const firstItem = cartStore.items[0].product_name
  return cartStore.items.length > 1 
    ? `${firstItem} 외 ${cartStore.items.length - 1}건` 
    : firstItem
})

// [변경] 결제 금액 계산 (바로구매 데이터 우선)
const totalAmount = computed(() => {
  if (isDirect.value && cartStore.pendingOrder) {
    return cartStore.pendingOrder.product_price
  }
  return cartStore.totalPrice
})

onMounted(async () => {
  // 데이터 검증: 바로구매인데 정보가 없거나, 장바구니인데 비어있으면 차단
  if (isDirect.value && !cartStore.pendingOrder) {
    alert('주문 정보가 없습니다.')
    router.push('/')
    return
  }
  if (!isDirect.value && cartStore.items.length === 0) {
    alert('결제할 상품이 없습니다.')
    router.push('/cart')
    return
  }

  try {
    const tossPayments = await loadTossPayments(clientKey)
    const widgetsInstance = tossPayments.widgets({ customerKey })

    // 결제 금액 설정
    await widgetsInstance.setAmount({
      currency: 'KRW',
      value: totalAmount.value,
    })

    // UI 렌더링
    await Promise.all([
      widgetsInstance.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
      widgetsInstance.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' })
    ])

    widgets.value = widgetsInstance
  } catch (err) {
    console.error('결제 위젯 로드 중 에러:', err)
  }
})

const handlePayment = async () => {
  if (!widgets.value) {
    alert('결제 준비가 되지 않았습니다.')
    return
  }

  isProcessing.value = true

  try {
    // [변경] 서버에 주문서 생성 시 상세페이지에서 받은 배송 정보를 전달
    // 바로구매면 pendingOrder 사용, 장바구니면 기본 정보(또는 로그인 정보) 사용
    const payload = {
      user_id: userStore.user?.id || null,
      product_name: orderTitle.value,
      total_price: totalAmount.value,
      // 상세페이지 다이얼로그에서 받은 정보 사용
      customer_name: isDirect.value ? cartStore.pendingOrder.customer_name : (userStore.user?.name || '장바구니구매자'),
      phone: isDirect.value ? cartStore.pendingOrder.phone : (userStore.user?.phone || '01000000000'),
      address: isDirect.value ? cartStore.pendingOrder.address : (userStore.user?.address || '기본 배송지'),
      product_id: isDirect.value ? cartStore.pendingOrder.product_id : null
    }

    const orderResponse = await axios.post('http://localhost:3000/api/orders/direct', payload)

    if (orderResponse.data.success) {
      const { toss_order_id } = orderResponse.data

      // 토스 결제 요청 시 mode를 successUrl에 포함시켜 전송 (성공 후 분기 처리용)
      const successUrl = new URL(window.location.origin + '/success')
      if (isDirect.value) successUrl.searchParams.append('mode', 'direct')

      await widgets.value.requestPayment({
        orderId: toss_order_id,
        orderName: orderTitle.value,
        successUrl: successUrl.toString(),
        failUrl: window.location.origin + '/fail',
        customerName: payload.customer_name,
      })
    }
  } catch (error) {
    isProcessing.value = false
    console.error('결제 처리 중 오류:', error)
    alert('주문 생성 실패: ' + (error.response?.data?.message || error.message))
  }
}
</script>

<style scoped>
.payment-container {
  width: 100%;
  max-width: 600px;
  border: 1px solid #eee;
}
#payment-method { width: 100%; min-height: 300px; }
</style>