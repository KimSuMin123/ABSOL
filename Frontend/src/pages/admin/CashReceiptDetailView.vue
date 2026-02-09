<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1000px;">
      <div class="text-h5 text-weight-bolder q-mb-lg row items-center">
        <q-icon name="payments" color="indigo-7" class="q-mr-sm" />
        현금영수증 관리 센터
        <div class="q-mr-xl"></div>
        <q-btn 
  href="https://dashboard.tosspayments.com/cash-receipts/tm/1561378?dateRange=2026-02-03+00%3A00%3A00&dateRange=2026-02-09+23%3A00%3A00&dateType=APPROVED_AT"
  target="_blank" 
  outline 
  color="indigo-7"
  label="토스 대시보드에서 조회" 
  class="text-weight-bold q-md-xl"
>
  <q-tooltip>토스페이먼츠 관리자 페이지로 이동합니다</q-tooltip>
</q-btn>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card flat bordered class="shadow-1" style="border-radius: 12px;">
            <q-card-section class="bg-indigo-7 text-white text-subtitle1 text-weight-bold">
              신규 수동 발행
            </q-card-section>
            <q-card-section class="q-gutter-y-md q-pt-lg">
              <q-btn-toggle
                v-model="issueForm.type"
                spread no-caps unelevated
                toggle-color="indigo-7" color="grey-2" text-color="grey-7"
                :options="[{label:'개인소득공제', value:'소득공제'}, {label:'사업자지출증빙', value:'지출증빙'}]"
              />
              <q-input outlined dense v-model="issueForm.orderName" label="상품명" />
              <q-input 
                outlined dense v-model="issueForm.customerIdentityNumber" 
                :label="issueForm.type === '소득공제' ? '휴대폰 번호' : '사업자 번호'"
                :mask="issueForm.type === '소득공제' ? '###-####-####' : '###-##-#####'"
              />
              <q-input outlined dense v-model.number="issueForm.amount" type="number" label="발행 금액" suffix="원" />
              <q-btn 
                label="즉시 발행 요청" color="indigo-7" class="full-width q-py-sm text-weight-bold" 
                :loading="loading.issue" @click="requestIssue" unelevated
              />
            </q-card-section>
          </q-card>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import axios from 'axios';

const $q = useQuasar();
const receipts = ref([]);
const loading = ref({ issue: false, list: false });
const BASE_URL = 'https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app';

const issueForm = ref({
  type: '소득공제',
  orderName: '',
  customerIdentityNumber: '',
  amount: 0
});

const requestIssue = async () => {
  if (issueForm.value.amount < 1) return $q.notify({ color: 'negative', message: '금액을 입력하세요.' });
  try {
    loading.value.issue = true;
    await axios.post(`${BASE_URL}/api/admin/cash-receipts`, {
      amount: issueForm.value.amount,
      orderName: issueForm.value.orderName,
      customerIdentityNumber: issueForm.value.customerIdentityNumber.replace(/-/g, ''),
      type: issueForm.value.type,
      orderId: 'MANUAL-' + Date.now() 
    });
    $q.notify({ color: 'positive', message: '발행 성공' });
    fetchReceipts();
    resetForm();
  } catch (e) {
    $q.notify({ color: 'negative', message: '발행 실패: ' + (e.response?.data?.message || '오류') });
  } finally { loading.value.issue = false; }
};

const fetchReceipts = async () => {
  try {
    loading.value.list = true;
    const today = date.formatDate(Date.now(), 'YYYY-MM-DD');
    const response = await axios.get(`${BASE_URL}/api/admin/cash-receipts`, {
      params: { requestDate: today }
    });
    // 데이터 구조에 따라 data.data 혹은 data 확인
    receipts.value = response.data.data || response.data || [];
  } catch (e) {
    console.error('조회 에러', e);
  } finally { loading.value.list = false; }
};

const requestCancel = async (receiptKey, amount) => {
  if (!confirm('정말 취소하시겠습니까?')) return;
  try {
    await axios.post(`${BASE_URL}/api/admin/cash-receipts/${receiptKey}/cancel`, { amount });
    $q.notify({ color: 'orange-9', message: '취소 완료' });
    fetchReceipts();
  } catch (e) {
    $q.notify({ color: 'negative', message: '취소 실패' });
  }
};

const resetForm = () => {
  issueForm.value.orderName = '';
  issueForm.value.customerIdentityNumber = '';
  issueForm.value.amount = 0;
};

onMounted(fetchReceipts);
</script>