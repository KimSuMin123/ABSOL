<template>
  <q-page class="flex flex-center q-pa-sm bg-grey-1">
    <q-card style="width: 100%; max-width: 450px;" flat bordered class="shadow-3">
      <q-card-section class="q-pa-md">
        <div class="text-h6 text-center q-mb-sm text-primary text-weight-bolder">
          PC 조립 견적 요청
        </div>
        
        <div v-if="userStore.isLoggedIn" class="q-mb-md q-pa-sm bg-blue-1 rounded-borders row items-center">
          <q-icon name="info" color="primary" size="xs" class="q-mr-xs" />
          <span class="text-caption text-primary text-weight-bold">회원 정보로 기본 정보가 자동 입력되었습니다.</span>
        </div>

        <q-form @submit="handleOrder" class="q-gutter-y-sm">
          <q-input 
            v-model="form.customer_name" 
            label="성함 *" 
            outlined dense 
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
            placeholder="성함을 입력해주세요"
          >
            <template v-slot:prepend><q-icon name="person" color="grey-6" /></template>
          </q-input>
          
          <q-input 
            v-model="form.contact" 
            label="연락처 *" 
            mask="###-####-####" 
            outlined dense 
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
            placeholder="010-0000-0000"
          >
            <template v-slot:prepend><q-icon name="phone" color="grey-6" /></template>
          </q-input>

          <div class="row q-gutter-x-sm items-center no-wrap">
            <q-input 
              v-model="form.postcode" 
              label="우편번호" 
              outlined dense readonly 
              class="col-4"
              :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
            />
            <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline class="col-auto" />
          </div>
          
          <q-input 
            v-model="form.address" 
            label="기본 주소 *" 
            outlined dense readonly 
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
            placeholder="주소 검색을 이용해주세요"
          />
          
          <q-input 
            v-model="form.detailAddress" 
            label="상세 주소 *" 
            outlined dense 
            ref="detailInput"
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
            placeholder="상세 주소를 입력해주세요"
          />

          <q-select 
            v-model="form.usage" 
            :options="['사무용', '게임용', '기타 고사양 작업']" 
            label="사용 용도 *" 
            outlined dense 
          >
            <template v-slot:prepend><q-icon name="computer" color="grey-6" /></template>
          </q-select>

          <q-input 
            v-model.number="form.budget" 
            type="number" 
            label="희망 예산 (단위: 만원) *" 
            outlined dense 
            suffix="만원"
          >
            <template v-slot:prepend><q-icon name="payments" color="grey-6" /></template>
          </q-input>

          <q-input
            v-model="form.description"
            type="textarea"
            label="추가 요청사항 (선택)"
            placeholder="선호하는 부품이나 용도를 자유롭게 적어주세요."
            maxlength="200"
            counter outlined dense
            rows="3" 
          />

          <div class="q-pa-sm bg-grey-2 rounded-borders">
            <q-checkbox 
              v-model="isAgreed" 
              label="개인정보 수집 및 이용 동의 (필수)" 
              color="primary" 
              dense 
            />
          </div>

          <q-btn 
            label="견적 신청하기" 
            type="submit" 
            color="primary" 
            class="full-width q-mt-sm"
            size="lg"
            :loading="store.loading" 
            :disable="!isAgreed"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useEstimateStore } from '../stores/estimate';
import { useUserStore } from '../stores/user';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const store = useEstimateStore();
const userStore = useUserStore();

const isAgreed = ref(false);
const detailInput = ref(null);

const form = ref({
  user_id: null,
  customer_name: '',
  contact: '',
  postcode: '',
  address: '',
  detailAddress: '',
  usage: '',
  budget: null,
  description: ''
});

// 데이터 자동 채우기
const autoFill = () => {
  if (userStore.isLoggedIn && userStore.user) {
    form.value.user_id = userStore.user.id;
    form.value.customer_name = userStore.user.name || '';
    form.value.contact = userStore.user.phone || '';
    form.value.address = userStore.user.address || '';
  }
};

onMounted(() => {
  autoFill();
});

// 유저 정보 변경 시 감시
watch(() => userStore.user, (newVal) => {
  if (newVal) autoFill();
}, { deep: true });

// Daum 주소 API
const openPostcode = () => {
  if (!window.daum) {
    $q.notify({ color: 'negative', message: '주소 라이브러리가 로드되지 않았습니다.' });
    return;
  }
  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      form.value.postcode = data.zonecode;
      form.value.address = fullAddr;
      setTimeout(() => detailInput.value.focus(), 100);
    }
  }).open();
};

const handleOrder = async () => {
  // 필수값 검증
  if (!form.value.customer_name || !form.value.contact || !form.value.address || !form.value.usage || !form.value.budget) {
    $q.notify({ color: 'warning', message: '모든 필수 항목(*)을 입력해주세요.' });
    return;
  }

  const submitData = {
    user_id: form.value.user_id,
    customer_name: form.value.customer_name,
    contact: form.value.contact,
    // 백엔드 full_address 컬럼에 저장될 데이터 가공
    full_address: form.value.postcode 
      ? `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`
      : `${form.value.address} ${form.value.detailAddress}`,
    usage: form.value.usage,
    budget: form.value.budget,
    description: form.value.description,
    privacy_agreed: 'Y'
  };

  const success = await store.submitEstimate(submitData);
  
  if (success) {
    $q.dialog({
      title: '신청 완료',
      message: '견적 요청이 성공적으로 접수되었습니다.',
    }).onOk(() => {
      location.reload(); // 성공 시 페이지 리로드
    });
  }
};
</script>

<style scoped>
.bg-blue-0 {
  background-color: #f0f7ff !important;
}
</style>