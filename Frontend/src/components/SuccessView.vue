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
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const loading = ref(true)
const isSuccess = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    // URL에 포함된 정보를 백엔드로 전달하여 '최종 승인'을 받음
    const response = await axios.post('http://localhost:3000/api/orders/confirm', {
      paymentKey: route.query.paymentKey,
      orderId: route.query.orderId,
      amount: route.query.amount,
    })

    if (response.status === 200) {
      isSuccess.value = true
    }
  } catch (err) {
    isSuccess.value = false
    errorMessage.value = err.response?.data?.message || '승인 처리 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
})
</script>