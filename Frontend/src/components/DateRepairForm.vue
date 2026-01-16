<template>
  <q-page class="flex flex-center q-pa-sm bg-grey-1">
    <q-card style="width: 100%; max-width: 500px;" flat bordered class="shadow-2">
      <q-card-section class="q-pa-md">
        <div class="text-h6 text-center q-mb-sm text-primary text-weight-bolder">PC 데이터 복구 신청</div>
        
        <div v-if="userStore.isLoggedIn" class="q-mb-md q-pa-sm bg-blue-1 rounded-borders row items-center">
          <q-icon name="info" color="primary" size="xs" class="q-mr-xs" />
          <span class="text-caption text-primary text-weight-bold">회원 정보로 주소가 자동 입력되었습니다.</span>
        </div>

        <q-form @submit="handleRecovery" class="q-gutter-y-sm">
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
            label="물품 회수 주소 *" 
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
            label="데이터 손실 상황/증상 (최대 200자) *"
            maxlength="200"
            counter outlined dense
            rows="3"
            placeholder="예: 외장하드 인식 불가, 포맷 메시지 뜸 등"
          />

          <div class="q-py-xs">
            <div class="text-caption text-red-6 q-mt-xs text-weight-medium">
              <q-icon name="warning" size="xs" /> 데이터 복구 특성상 정밀 점검 후 복구 비용이 안내됩니다.
            </div>
          </div>

          <div class="q-pa-sm bg-grey-2 rounded-borders">
           <q-checkbox v-model="isAgreed" label="개인정보 수집 및 복구 정책 동의 (필수)" color="primary" dense />
          </div>

          <q-btn 
            label="복구 서비스 신청하기" 
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
import { useUserStore } from '../stores/user';

const $q = useQuasar();
const userStore = useUserStore();

const isAgreed = ref(false);
const loading = ref(false);
const detailInput = ref(null);

const form = ref({
  user_id: null,
  repair_type: '복구', // 모델 ENUM값에 맞춤 ('복구', '방문복구', '복구불가')
  customer_name: '',
  contact: '',
  postcode: '',
  address: '',
  detailAddress: '',
  symptoms: ''
});

// 자동 채우기 로직 (회원 정보 활용)
const autoFill = () => {
  if (userStore.isLoggedIn && userStore.user) {
    form.value.user_id = userStore.user.id;
    form.value.customer_name = userStore.user.name || '';
    form.value.contact = userStore.user.phone || '';
    
    const rawAddress = (userStore.user.address || '').trim();
    if (!rawAddress) return;

    const postcodeMatch = rawAddress.match(/\(?(\d{5})\)?/);
    if (postcodeMatch) {
      form.value.postcode = postcodeMatch[1];
      let remaining = rawAddress.replace(postcodeMatch[0], '').trim();
      const splitRegex = /(.*(?:로|길|동|읍|면|리)\s\d+)(.*)/;
      const addrMatch = remaining.match(splitRegex);

      if (addrMatch) {
        form.value.address = addrMatch[1].trim();
        form.value.detailAddress = addrMatch[2].trim();
      } else {
        form.value.address = remaining;
        form.value.detailAddress = '';
      }
    } else {
      form.value.address = rawAddress;
    }
  }
};

onMounted(() => {
  autoFill();
});

watch(() => userStore.user, (newVal) => {
  if (newVal && newVal.id) autoFill();
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
      form.value.detailAddress = '';
      setTimeout(() => detailInput.value.focus(), 100);
    }
  }).open();
};

const handleRecovery = async () => {
  if (!form.value.customer_name || !form.value.contact || !form.value.address || !form.value.symptoms) {
    $q.notify({ color: 'warning', message: '복구를 위해 모든 필수 정보를 입력해 주세요.' });
    return;
  }

  loading.value = true;
  try {
    const payload = {
      user_id: form.value.user_id,
      repair_type: form.value.repair_type,
      customer_name: form.value.customer_name,
      contact: form.value.contact,
      symptoms: form.value.symptoms,
      // DB 모델의 address 필드에 (우편번호) 주소 상세주소 형태로 저장
      address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`.trim(),
     
    };

    // 엔드포인트를 데이터 복구 전용 API로 변경 (확인 필요)
    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/data-repairs', payload);
    
    if (res.data.success) {
      $q.dialog({
        title: '접수 완료',
        message: '데이터 복구 신청이 정상적으로 접수되었습니다. 담당자가 곧 연락드리겠습니다.',
      }).onOk(() => {
        location.reload(); 
      });
    }
  } catch (err) {
    console.error(err);
    $q.notify({ color: 'negative', message: '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
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