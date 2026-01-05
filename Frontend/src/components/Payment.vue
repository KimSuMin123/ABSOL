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
import { useUserStore } from '../stores/user'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const cartStore = useCartStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const widgets = ref(null)
const isProcessing = ref(false)
const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
const customerKey = 'USER_' + (userStore.user?.id || Math.random().toString(36).slice(2, 11))

// [핵심] 현재 결제 모드 판별 (3가지 상태)
const currentMode = computed(() => {
  if (route.query.mode === 'direct') return 'DIRECT'     // 단일 상품 바로구매
  if (route.query.mode === 'membership') return 'MEMBERSHIP' // 멤버십 업그레이드
  return 'CART' // 기본값: 장바구니
})

// [변경] 주문 명칭 계산 (모든 상품명과 수량 나열)
const orderTitle = computed(() => {
  // 1. 단품 바로 구매 (DIRECT) 모드
  if (currentMode.value === 'DIRECT' && cartStore.pendingOrder) {
    return cartStore.pendingOrder.product_name
  }

  // 2. 멤버십 결제 모드
  if (currentMode.value === 'MEMBERSHIP') {
    return `${route.query.level} 멤버십 업그레이드`
  }

  // 3. 장바구니 결제 모드 (상품이 없을 때)
  if (cartStore.items.length === 0) return '상품 정보 없음'

  // 4. 장바구니 결제 모드 (상품이 1개 이상일 때 전체 나열)
  // 모든 상품을 "상품명 수량개" 형태로 만들고 쉼표로 연결합니다.
  return cartStore.items
    .map(item => `${item.product_name} ${item.quantity}개`)
    .join(', ')
})
// [변경] 결제 금액 계산
const totalAmount = computed(() => {
  if (currentMode.value === 'DIRECT' && cartStore.pendingOrder) {
    return cartStore.pendingOrder.product_price
  }
  if (currentMode.value === 'MEMBERSHIP') {
    return Number(route.query.price || 0)
  }
  return cartStore.totalPrice
})

onMounted(async () => {
  // 데이터 검증 로직
  if (currentMode.value === 'DIRECT' && !cartStore.pendingOrder) {
    alert('주문 정보가 없습니다.'); router.push('/'); return
  }
  if (currentMode.value === 'CART' && cartStore.items.length === 0) {
    alert('장바구니가 비어있습니다.'); router.push('/cart'); return
  }

  try {
    const tossPayments = await loadTossPayments(clientKey)
    const widgetsInstance = tossPayments.widgets({ customerKey })

    await widgetsInstance.setAmount({ currency: 'KRW', value: totalAmount.value })

    await Promise.all([
      widgetsInstance.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
      widgetsInstance.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' })
    ])
    widgets.value = widgetsInstance
  } catch (err) {
    console.error('위젯 로드 에러:', err)
  }
})

const handlePayment = async () => {
  if (!widgets.value) return
  isProcessing.value = true

  try {
    let toss_order_id = ''
    
    // 1. 멤버십은 별도의 주문 생성 없이 토스 전용 ID 생성 (또는 전용 API 호출)
    if (currentMode.value === 'MEMBERSHIP') {
      toss_order_id = `MEMBERSHIP_${userStore.user?.id}_${Date.now()}`
    } else {
      // 2. 일반 주문(Direct/Cart)은 백엔드에 주문서 먼저 생성
      const payload = {
        user_id: userStore.user?.id || null,
        product_name: orderTitle.value,
        total_price: totalAmount.value,
        customer_name: currentMode.value === 'DIRECT' ? cartStore.pendingOrder.customer_name : (userStore.user?.name || '구매자'),
        phone: currentMode.value === 'DIRECT' ? cartStore.pendingOrder.phone : (userStore.user?.phone || '01000000000'),
        address: currentMode.value === 'DIRECT' ? cartStore.pendingOrder.address : (userStore.user?.address || '기본배송지'),
        product_id: currentMode.value === 'DIRECT' ? cartStore.pendingOrder.product_id : null
      }
      const res = await axios.post('http://localhost:3000/api/orders/direct', payload)
      toss_order_id = res.data.toss_order_id
    }

    // 성공 시 이동할 URL 설정 (모드와 레벨 정보를 포함)
    const successUrl = new URL(window.location.origin + '/success')
    successUrl.searchParams.append('mode', currentMode.value.toLowerCase())
    if (currentMode.value === 'MEMBERSHIP') {
      successUrl.searchParams.append('level', route.query.level)
    }

    await widgets.value.requestPayment({
      orderId: toss_order_id,
      orderName: orderTitle.value,
      successUrl: successUrl.toString(),
      failUrl: window.location.origin + '/fail',
      customerName: userStore.user?.name || '구매자'
    })
  } catch (error) {
    isProcessing.value = false
    alert('결제 준비 실패: ' + (error.response?.data?.message || error.message))
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