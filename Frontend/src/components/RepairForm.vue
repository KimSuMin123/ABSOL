<template>
  <q-page class="flex flex-center q-pa-sm bg-grey-1">
    <q-card style="width: 100%; max-width: 500px;" flat bordered class="shadow-2">
      <q-card-section class="q-pa-md">
        <div class="text-h6 text-center q-mb-sm text-primary text-weight-bolder">PC 수리 요청</div>
        
        <div v-if="userStore.isLoggedIn" class="q-mb-md q-pa-sm bg-blue-1 rounded-borders row items-center">
          <q-icon name="info" color="primary" size="xs" class="q-mr-xs" />
          <span class="text-caption text-primary text-weight-bold">회원 정보로 주소가 자동 입력되었습니다.</span>
        </div>

        <q-form @submit="handleRepair" class="q-gutter-y-sm">
          <q-input 
            v-model="form.customer_name" 
            label="성함 *" 
            outlined dense 
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
          />
          
          <q-input 
            v-model="form.contact" 
            label="연락처 *" 
            mask="###-####-####" 
            outlined dense 
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
          />
          
          <div class="row q-gutter-x-sm items-center no-wrap">
            <q-input 
              v-model="form.postcode" 
              label="우편번호" 
              outlined dense 
              readonly 
              class="col-4"
              :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
            />
            <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline class="col-auto" />
          </div>
          
          <q-input 
            v-model="form.address" 
            :label="form.repair_type === '방문수리' ? '방문 희망 주소 *' : '회수 주소 *'" 
            outlined dense 
            readonly 
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
          />
          
          <q-input 
            v-model="form.detailAddress" 
            label="상세 주소 *" 
            outlined dense 
            ref="detailInput"
            :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'"
          />

          <q-input
            v-model="form.symptoms"
            type="textarea"
            label="고장 증상 (최대 200자)"
            maxlength="200"
            counter outlined dense
            rows="3"
          />

          <div class="q-py-xs">
          
            <div class="text-caption text-red-6 q-mt-xs text-weight-medium">
              <q-icon name="info" size="xs" /> 출장 수리로 진행되어 출장비(1만원~3만원)이 발생할 수 있습니다. 
            </div>
          </div>

          <div class="q-pa-sm bg-grey-2 rounded-borders">
            <q-checkbox v-model="isAgreed" label="개인정보 수집 및 이용 동의 (필수)" color="primary" dense />
          </div>

          <q-btn 
            label="수리 신청하기" 
            type="submit" 
            color="primary" 
            class="full-width q-mt-sm"
            size="lg"
            :loading="loading" 
            :disable="!isAgreed"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user'; // 유저 스토어 추가

const $q = useQuasar();
const userStore = useUserStore(); // 스토어 인스턴스

const isAgreed = ref(false);
const loading = ref(false);
const detailInput = ref(null);

const form = ref({
  user_id: null, // user_id 추가
  repair_type: '수리',
  customer_name: '',
  contact: '',
  postcode: '',
  address: '',
  detailAddress: '',
  symptoms: ''
});

// 데이터 자동 채우기 함수
const autoFill = () => {
  if (userStore.isLoggedIn && userStore.user) {
    form.value.user_id = userStore.user.id;
    form.value.customer_name = userStore.user.name || '';
    form.value.contact = userStore.user.phone || '';
    
    // 주소가 문자열 하나로 되어 있는 경우 (예: "(12345) 서울시... 상세주소")
    // 만약 DB 주소에 우편번호가 포함되어 있다면 파싱 로직이 필요할 수 있습니다.
    // 여기서는 기본적으로 address 필드를 통째로 address 칸에 넣어줍니다.
    form.value.address = userStore.user.address || '';
  }
};

// 마운트 시 실행
onMounted(() => {
  autoFill();
});

// 유저 데이터 변화 감시 (새로고침 대응)
watch(() => userStore.user, (newVal) => {
  if (newVal && newVal.id) {
    autoFill();
  }
}, { deep: true, immediate: true });

const openPostcode = () => {
  if (!window.daum) {
    $q.notify({ color: 'negative', message: '주소 서비스 라이브러리가 로드되지 않았습니다.' });
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

const handleRepair = async () => {
  if (!form.value.customer_name || !form.value.contact || !form.value.address) {
    $q.notify({ color: 'warning', message: '필수 정보를 입력해주세요.' });
    return;
  }

  loading.value = true;
  try {
    const payload = {
      ...form.value,
      full_address: form.value.postcode 
        ? `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`
        : `${form.value.address} ${form.value.detailAddress}`
    };

    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/repairs', payload);
    
    if (res.data.success) {
      $q.dialog({
        title: '신청 완료',
        message: `${form.value.repair_type} 신청이 성공적으로 접수되었습니다.`,
      }).onOk(() => {
        // 성공 후 리로드 혹은 이동
        location.reload(); 
      });
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '신청 중 오류가 발생했습니다.' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.bg-blue-0 {
  background-color: #f0f7ff !important;
}
</style>