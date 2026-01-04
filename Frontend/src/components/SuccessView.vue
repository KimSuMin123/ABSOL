<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card flat bordered class="q-pa-xl text-center shadow-2" style="max-width: 450px">
      <div v-if="loading">
        <q-spinner-ios color="primary" size="4em" />
        <div class="text-h6 q-mt-md">결제 승인 중...</div>
      </div>

      <div v-else-if="result === 'success'">
        <q-icon name="check_circle" color="positive" size="5em" />
        <div class="text-h5 text-weight-bold q-mt-md">결제 성공!</div>
        <p class="text-grey-8 q-mt-sm">
          {{ isMembership ? '멤버십 등급이 상향되었습니다.' : '주문이 정상적으로 접수되었습니다.' }}
        </p>
        <q-btn label="확인" color="primary" class="full-width q-mt-lg" to="/mypage" />
      </div>

      <div v-else>
        <q-icon name="error" color="negative" size="5em" />
        <div class="text-h5 text-weight-bold q-mt-md">승인 처리 실패</div>
        <p class="text-grey-7 q-mt-sm">{{ errorMsg }}</p>
        <q-btn label="마이페이지로 돌아가기" flat class="full-width q-mt-md" to="/mypage" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const loading = ref(true);
const result = ref('');
const errorMsg = ref('');

const isMembership = computed(() => route.query.mode === 'membership');

onMounted(async () => {
  try {
    const { paymentKey, orderId, amount, level } = route.query;

    const res = await axios.post('http://localhost:3000/api/orders/confirm', {
      paymentKey,
      orderId,
      amount: Number(amount),
      targetLevel: level // 멤버십일 경우 사용
    });

    if (res.data.success) {
      result.value = 'success';
    }
  } catch (err) {
    result.value = 'fail';
    errorMsg.value = err.response?.data?.message || '서버 승인 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
});
</script>