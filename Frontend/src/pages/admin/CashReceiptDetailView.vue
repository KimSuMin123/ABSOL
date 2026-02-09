<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1000px;">
      <div class="text-h5 text-weight-bolder q-mb-lg row items-center">
        <q-icon name="payments" color="indigo-7" class="q-mr-sm" />
        현금영수증 관리 센터 (수동)
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-5">
          <q-card flat bordered class="shadow-1" style="border-radius: 12px;">
            <q-card-section class="bg-indigo-7 text-white">
              <div class="text-subtitle1 text-weight-bold">신규 수동 발행</div>
            </q-card-section>

            <q-card-section class="q-gutter-y-md q-pt-lg">
              <q-btn-toggle
                v-model="issueForm.type"
                spread no-caps unelevated
                toggle-color="indigo-7" color="grey-2" text-color="grey-7"
                :options="[{label:'개인소득공제', value:'소득공제'}, {label:'사업자지출증빙', value:'지출증빙'}]"
              />
              
              <q-input outlined dense v-model="issueForm.orderName" label="상품명 (예: 서비스 이용료)" />
              <q-input 
                outlined dense v-model="issueForm.customerIdentityNumber" 
                :label="issueForm.type === '소득공제' ? '휴대폰 번호' : '사업자 번호'"
                :mask="issueForm.type === '소득공제' ? '###-####-####' : '###-##-#####'"
              />
              <q-input outlined dense v-model.number="issueForm.amount" type="number" label="발행 금액" suffix="원" />
              
              <q-btn 
                label="즉시 발행 요청" color="indigo-7" class="full-width q-py-sm" 
                :loading="loading.issue" @click="requestIssue"
              />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-7">
          <q-card flat bordered class="shadow-1" style="border-radius: 12px;">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-subtitle1 text-weight-bold">오늘의 발행 내역</div>
              <q-space />
              <q-btn icon="refresh" flat round dense @click="fetchReceipts" :loading="loading.list" />
            </q-card-section>

            <q-card-section>
              <q-list separator v-if="receipts.length > 0">
                <q-item v-for="receipt in receipts" :key="receipt.receiptKey" class="q-px-none q-py-md">
                  <q-item-section>
                    <q-item-label class="row items-center">
                      <q-badge :color="receipt.transactionType === 'CONFIRM' ? 'blue' : 'red'" class="q-mr-sm">
                        {{ receipt.transactionType === 'CONFIRM' ? '발행' : '취소' }}
                      </q-badge>
                      <span class="text-weight-bold">{{ receipt.orderName }}</span>
                    </q-item-label>
                    <q-item-label caption class="q-mt-xs">
                      금액: {{ receipt.amount.toLocaleString() }}원 | 번호: {{ receipt.customerIdentityNumber }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn 
                      v-if="receipt.transactionType === 'CONFIRM' && receipt.issueStatus === 'COMPLETED'"
                      label="발행 취소" color="red-7" outline size="sm" 
                      @click="requestCancel(receipt.receiptKey)"
                    />
                    <q-btn 
                      v-else-if="receipt.issueStatus === 'IN_PROGRESS'" 
                      label="처리 중" color="orange" flat size="sm" icon="pending" 
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-center q-pa-xl text-grey-5">
                금일 발행 내역이 없습니다.
              </div>
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
import { api } from '../../boot/axios';

const $q = useQuasar();
const receipts = ref([]);
const loading = ref({ issue: false, list: false });

const issueForm = ref({
  type: '소득공제',
  orderName: '',
  customerIdentityNumber: '',
  amount: 0
});

// 1. 현금영수증 발급 요청
const requestIssue = async () => {
  if (issueForm.value.amount < 1) return alert('금액을 입력하세요.');
  
  try {
    loading.value.issue = true;
    const response = await api.post('/api/admin/cash-receipts', {
      amount: issueForm.value.amount,
      orderName: issueForm.value.orderName,
      customerIdentityNumber: issueForm.value.customerIdentityNumber.replace(/-/g, ''),
      type: issueForm.value.type,
      // orderId는 백엔드에서 생성하거나 여기서 생성 (6자 이상 무작위)
      orderId: 'MANUAL-' + Date.now() 
    });
    
    $q.notify({ color: 'positive', message: '발행 요청 완료(IN_PROGRESS)' });
    fetchReceipts(); // 목록 갱신
    resetForm();
  } catch (e) {
    $q.notify({ color: 'negative', message: '발행 실패: ' + e.message });
  } finally {
    loading.value.issue = false;
  }
};

// 2. 현금영수증 조회 (오늘 날짜 기준)
const fetchReceipts = async () => {
  try {
    loading.value.list = true;
    const today = date.formatDate(Date.now(), 'YYYY-MM-DD');
    const response = await api.get('/api/admin/cash-receipts', {
      params: { requestDate: today }
    });
    receipts.value = response.data.data || [];
  } catch (e) {
    console.error('조회 에러', e);
  } finally {
    loading.value.list = false;
  }
};

// 3. 현금영수증 취소
const requestCancel = async (receiptKey) => {
  if (!confirm('정말 취소하시겠습니까?')) return;
  
  try {
    await api.post(`/api/admin/cash-receipts/${receiptKey}/cancel`);
    $q.notify({ color: 'orange-8', message: '취소 요청이 완료되었습니다.' });
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