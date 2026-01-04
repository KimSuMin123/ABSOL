<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg text-center" style="width: 400px; border-radius: 12px shadow-3">
      
      <div v-if="loading">
        <q-spinner-ios color="primary" size="50px" />
        <div class="text-h6 q-mt-md">결제 승인 확인 중...</div>
      </div>

      <div v-else-if="isSuccess">
        <q-icon name="check_circle" color="positive" size="80px" />
        <div class="text-h5 q-mt-md text-bold text-positive">결제에 성공하였습니다.</div>
    
        <q-btn label="홈으로 돌아가기" color="primary" class="full-width q-mt-lg" to="/" />
      </div>

      <div v-else>
        <q-icon name="error" color="negative" size="80px" />
        <div class="text-h5 q-mt-md text-bold text-negative">결제에 실패하였습니다.</div>
        <p class="q-mt-sm text-grey-7">{{ errorMessage }}</p>
        <q-btn label="다시 시도" color="negative" class="full-width q-mt-lg" to="/" />
      </div>

    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const cartStore = useCartStore()

const loading = ref(true)
const isSuccess = ref(false)

onMounted(async () => {
  try {
    // 쿼리 파라미터 확인 (토스에서 보내줌)
    const { paymentKey, orderId, amount } = route.query

    // 백엔드 confirm API 호출
    const response = await axios.post('http://localhost:3000/api/orders/confirm', {
      paymentKey,
      orderId,
      amount
    })

    if (response.data.success) {
      isSuccess.value = true
   
      $q.notify({ type: 'positive', message: '결제가 완료되었습니다!' })
    }
  } catch (err) {
    console.error(err)
    isSuccess.value = false
  } finally {
    loading.value = false
  }
})
</script>