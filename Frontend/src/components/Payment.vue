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
              {{ cartStore.totalPrice.toLocaleString() }}원
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
        to="/cart" 
      />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

// 상태 관리
const widgets = ref(null)
const isProcessing = ref(false)

// 토스페이먼츠 설정값 (실제 연동 시 본인의 키로 교체)
const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
const customerKey = 'USER_' + Math.random().toString(36).slice(2, 11) 

// 주문명 계산 (예: 'RTX 4060 외 2건')
const orderTitle = computed(() => {
  if (cartStore.items.length === 0) return '상품 정보 없음'
  const firstItem = cartStore.items[0].product_name
  return cartStore.items.length > 1 
    ? `${firstItem} 외 ${cartStore.items.length - 1}건` 
    : firstItem
})

onMounted(async () => {
  // 장바구니가 비어있으면 뒤로가기
  if (cartStore.items.length === 0) {
    alert('결제할 상품이 없습니다.')
    router.push('/cart')
    return
  }

  try {
    const tossPayments = await loadTossPayments(clientKey)
    
    // 1. 위젯 인스턴스 초기화
    const widgetsInstance = tossPayments.widgets({
      customerKey: customerKey
    })

    // 2. 결제 금액 설정 (Pinia 스토어의 실제 합계)
    await widgetsInstance.setAmount({
      currency: 'KRW',
      value: cartStore.totalPrice,
    })

    // 3. 결제 수단 및 약관 렌더링
    await Promise.all([
      widgetsInstance.renderPaymentMethods({
        selector: '#payment-method',
        variantKey: 'DEFAULT',
      }),
      widgetsInstance.renderAgreement({
        selector: '#agreement',
        variantKey: 'AGREEMENT',
      })
    ])

    widgets.value = widgetsInstance
  } catch (err) {
    console.error('결제 위젯 로드 중 에러:', err)
  }
})

const handlePayment = async () => {
  if (!widgets.value) {
    alert('결제 준비가 되지 않았습니다. 잠시만 기다려주세요.')
    return
  }

  isProcessing.value = true

  try {
    // 4. 결제 요청
    await widgets.value.requestPayment({
      orderId: 'ORDER_' + Date.now(), // 고유한 주문 번호 생성
      orderName: orderTitle.value,
      successUrl: window.location.origin + '/success',
      failUrl: window.location.origin + '/fail',
      customerEmail: 'customer@example.com', // 필요 시 Pinia 유저 정보에서 가져오기
      customerName: '구매자',
    })
  } catch (error) {
    isProcessing.value = false
    console.error('결제 요청 중 에러:', error)
  }
}
</script>

<style scoped>
.payment-container {
  width: 100%;
  max-width: 600px;
  border: 1px solid #eee;
}

#payment-method {
  width: 100%;
  min-height: 300px;
}
</style>