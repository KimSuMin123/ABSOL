<template>
  <q-page class="flex flex-center q-pa-md bg-grey-2">
    <q-card style="width: 100%; max-width: 550px;" class="shadow-10">
      <q-card-section class="text-h6 bg-dark text-white text-center">
        PC 데이터 복구 신청
      </q-card-section>

      <q-card-section class="q-gutter-y-md q-pt-lg">
        <div v-if="userStore.isLoggedIn" class="q-mb-md q-pa-sm bg-blue-1 rounded-borders row items-center">
          <q-icon name="info" color="primary" size="xs" class="q-mr-xs" />
          <span class="text-caption text-primary text-weight-bold">회원 정보로 주소가 자동 입력되었습니다.</span>
        </div>

        <q-form @submit="handleRecovery" class="q-gutter-y-sm">
          <q-input v-model="form.customer_name" label="성함 *" outlined dense :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
          
          <q-input v-model="form.contact" label="연락처 *" mask="###-####-####" outlined dense :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
          
          <div class="row q-gutter-x-sm items-center no-wrap">
            <q-input v-model="form.postcode" label="우편번호" outlined dense readonly class="col-4" :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
            <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline class="col-auto" />
          </div>
          
          <q-input v-model="form.address" label="물품 회수 주소 *" outlined dense readonly :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
          
          <q-input v-model="form.detailAddress" label="상세 주소 *" outlined dense ref="detailInput" :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />

          <q-input v-model="form.symptoms" type="textarea" label="데이터 손실 상황/증상 (최대 200자) *" maxlength="200" counter outlined dense rows="3" placeholder="예: 외장하드 인식 불가, 포맷 메시지 뜸 등" />

          <div class="q-py-xs">
            <div class="text-caption text-red-6 q-mt-xs text-weight-medium">
              <q-icon name="warning" size="xs" /> 데이터 복구 특성상 정밀 점검 후 복구 비용이 안내됩니다.
            </div>
          </div>

          <div class="q-pa-sm bg-grey-2 rounded-borders row items-center no-wrap">
            <q-checkbox 
              v-model="form.privacy_agreed" 
              label="개인정보 수집 및 이용약관 동의 (필수)" 
              color="primary" 
              dense
              true-value="Y"
              false-value="N"
              class="col"
            />
            <q-btn 
              label="[내용보기]" 
              color="grey-7" 
              flat 
              dense 
              size="sm"
              @click="termsDialogOpen = true" 
            />
          </div>

          <q-card-actions align="center" class="q-px-none q-pt-lg">
            <q-btn 
              v-if="form.privacy_agreed !== 'Y'"
              label="약관에 동의해 주세요" 
              color="grey-6" 
              class="full-width" 
              size="lg"
              unelevated
              @click="termsDialogOpen = true"
            />
            <q-btn 
              v-else
              label="복구 서비스 신청하기" 
              type="submit"
              color="primary" 
              class="full-width" 
              size="lg"
              :loading="loading"
              unelevated
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>

    <q-dialog v-model="termsDialogOpen" persistent>
      <q-card style="width: 550px; max-width: 95vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">이용약관 및 개인정보 동의</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <TermsOfService />
        </q-card-section>
        
        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-checkbox 
            v-model="form.privacy_agreed" 
            label="위 약관을 모두 읽었으며 동의합니다." 
            true-value="Y" 
            false-value="N" 
            color="primary"
            class="q-mr-auto"
          />
          <q-btn flat label="닫기" color="grey" v-close-popup />
          <q-btn 
            label="동의 및 확인" 
            color="primary" 
            v-close-popup 
            :disabled="form.privacy_agreed !== 'Y'"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';
import TermsOfService from '../components/TermsOfService.vue';

const $q = useQuasar();
const userStore = useUserStore();

const loading = ref(false);
const termsDialogOpen = ref(false);
const detailInput = ref(null);

const form = ref({
  user_id: null,
  repair_type: '복구',
  customer_name: '',
  contact: '',
  postcode: '',
  address: '',
  detailAddress: '',
  symptoms: '',
  privacy_agreed: 'N'
});

const autoFill = () => {
  if (userStore.isLoggedIn && userStore.user) {
    form.value.privacy_agreed = 'Y';
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

onMounted(() => { autoFill(); });
watch(() => userStore.user, (newVal) => { if (newVal && newVal.id) autoFill(); }, { deep: true, immediate: true });

const openPostcode = () => {
  if (!window.kakao) {
    $q.notify({ color: 'negative', message: '주소 서비스 라이브러리가 로드되지 않았습니다.' });
    return;
  }
  new window.kakao.Postcode({
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
      address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`.trim(),
    };

    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/data-repairs', payload);
    
    if (res.status === 200 || res.status === 201) {
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
.bg-blue-0 { background-color: #f0f7ff !important; }
</style>