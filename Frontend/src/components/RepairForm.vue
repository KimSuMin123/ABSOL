<template>
  <q-page class="flex flex-center q-pa-md bg-grey-2">
    <q-card style="width: 100%; max-width: 500px;" class="shadow-10 ">
      <q-card-section class="text-h6 bg-dark text-white text-center text-weight-bold">
        PC 수리 요청
      </q-card-section>

      <q-card-section class="q-gutter-y-sm q-pt-lg">
        <div v-if="userStore.isLoggedIn" class="q-mb-md q-pa-sm bg-blue-1 rounded-borders row items-center">
          <q-icon name="info" color="primary" size="xs" class="q-mr-xs" />
          <span class="text-caption text-primary text-weight-bold">회원 정보로 주소가 자동 입력되었습니다.</span>
        </div>

        <q-form @submit="handleRepair" class="q-gutter-y-sm">
          <q-input v-model="form.customer_name" label="성함 *" outlined dense :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
          <q-input v-model="form.contact" label="연락처 *" mask="###-####-####" outlined dense :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />

          <div class="row q-gutter-x-sm items-center no-wrap">
            <q-input v-model="form.postcode" label="우편번호" outlined dense readonly class="col-4" :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
            <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline class="col-auto" />
          </div>
          <q-input v-model="form.address" :label="form.repair_type === '방문수리' ? '방문 희망 주소 *' : '회수 주소 *'" outlined dense readonly :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
          <q-input v-model="form.detailAddress" label="상세 주소 *" outlined dense ref="detailInput" :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />

          <q-input v-model="form.symptoms" type="textarea" label="고장 증상 (최대 200자) *" placeholder="예: 전원이 안 들어옴, 블루스크린 발생 등" maxlength="200" counter outlined dense rows="3" />

          <div class="q-py-xs">
            <div class="text-caption text-red-6 q-mt-xs text-weight-medium">
              <q-icon name="info" size="xs" /> 출장 수리 시 거리에 따른 출장비가 발생할 수 있습니다.
            </div>
          </div>

          <div class="q-pa-sm bg-grey-2 rounded-borders row items-center no-wrap q-mt-md">
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

          <div class="q-mt-md">
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
              label="수리 신청하기" 
              type="submit" 
              color="primary" 
              class="full-width"
              size="lg"
              unelevated
              :loading="loading" 
            />
          </div>
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
  repair_type: '수리',
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
    const raw = (userStore.user.address || '').trim();
    if (!raw) return;
    const pcMatch = raw.match(/\(?(\d{5})\)?/);
    if (pcMatch) {
      form.value.postcode = pcMatch[1];
      let rem = raw.replace(pcMatch[0], '').trim();
      const split = /(.*(?:로|길|동|읍|면|리)\s\d+)(.*)/;
      const m = rem.match(split);
      if (m) { form.value.address = m[1].trim(); form.value.detailAddress = m[2].trim(); }
      else { form.value.address = rem; }
    } else { form.value.address = raw; }
  }
};

onMounted(autoFill);
watch(() => userStore.user, autoFill, { deep: true, immediate: true });

const openPostcode = () => {
  new window.kakao.Postcode({
    oncomplete: (data) => {
      form.value.postcode = data.zonecode;
      form.value.address = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      form.value.detailAddress = '';
      setTimeout(() => detailInput.value.focus(), 100);
    }
  }).open();
};

const handleRepair = async () => {
  if (!form.value.customer_name || !form.value.contact || !form.value.postcode || !form.value.address || !form.value.symptoms) {
    return $q.notify({ color: 'warning', message: '필수 정보를 모두 입력해주세요.' });
  }
  loading.value = true;
  try {
    const payload = {
      ...form.value,
      address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`.trim()
    };
    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/repairs', payload);
    if (res.data.success) {
      $q.dialog({ title: '신청 완료', message: '수리 신청이 접수되었습니다.' }).onOk(() => location.reload());
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '오류가 발생했습니다. 다시 시도해주세요.' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.border-radius-16 { border-radius: 16px; overflow: hidden; }
.bg-blue-0 { background-color: #f0f7ff !important; }
</style>