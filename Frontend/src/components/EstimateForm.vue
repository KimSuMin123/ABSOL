<template>
  <q-page class="flex flex-center q-pa-md bg-grey-2">
    <q-card style="width: 100%; max-width: 500px;" class="shadow-10 ">
      <q-card-section class="text-h6 bg-dark text-white text-center text-weight-bold">
        PC 조립 견적 요청
      </q-card-section>

      <q-card-section class="q-gutter-y-sm q-pt-lg">
        <div v-if="userStore.isLoggedIn" class="q-mb-md q-pa-sm bg-blue-1 rounded-borders row items-center">
          <q-icon name="info" color="primary" size="xs" class="q-mr-xs" />
          <span class="text-caption text-primary text-weight-bold">회원 정보로 기본 정보가 자동 입력되었습니다.</span>
        </div>

        <q-form @submit="handleOrder" class="q-gutter-y-sm">
          <q-input v-model="form.customer_name" label="성함 *" outlined dense :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
          <q-input v-model="form.contact" label="연락처 *" mask="###-####-####" outlined dense :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />

          <div class="row q-gutter-x-sm items-center no-wrap">
            <q-input v-model="form.postcode" label="우편번호" outlined dense readonly class="col-4" :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
            <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline class="col-auto" />
          </div>
          <q-input v-model="form.address" label="배송 주소 *" outlined dense readonly :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />
          <q-input v-model="form.detailAddress" label="상세 주소 *" outlined dense ref="detailInput" :bg-color="userStore.isLoggedIn ? 'blue-0' : 'white'" />

          <q-select v-model="form.usage" :options="['사무용', '게임용', '고사양 작업']" label="사용 용도 *" outlined dense />
          <q-input v-model.number="form.budget" type="number" label="희망 예산 (만원) *" outlined dense suffix="만원" />
          <q-input v-model="form.description" type="textarea" label="추가 요청사항 (선택)" placeholder="선호하는 부품 등을 적어주세요." maxlength="200" counter outlined dense rows="2" />

          <div class="q-pa-sm bg-grey-2 rounded-borders row items-center no-wrap q-mt-md">
            <q-checkbox v-model="form.privacy_agreed" label="개인정보 수집 및 이용약관 동의 (필수)" color="primary" dense true-value="Y" false-value="N" class="col" />
            <q-btn label="[내용보기]" color="grey-7" flat dense size="sm" @click="termsDialogOpen = true" />
          </div>

          <div class="q-mt-md">
            <q-btn v-if="form.privacy_agreed !== 'Y'" label="약관에 동의해 주세요" color="grey-6" class="full-width" size="lg" unelevated @click="termsDialogOpen = true" />
            <q-btn v-else label="견적 신청하기" type="submit" color="primary" class="full-width" size="lg" unelevated :loading="estimateStore.loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-dialog v-model="termsDialogOpen" persistent>
      <q-card style="width: 550px; max-width: 95vw;">
        <q-card-section class="row items-center q-pb-none text-h6 text-weight-bold">이용약관 및 동의<q-space /><q-btn icon="close" flat round v-close-popup /></q-card-section>
        <q-card-section class="scroll" style="max-height: 60vh"><TermsOfService /></q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-checkbox v-model="form.privacy_agreed" label="모두 동의합니다." true-value="Y" false-value="N" color="primary" class="q-mr-auto" />
          <q-btn flat label="닫기" color="grey" v-close-popup />
          <q-btn label="확인 완료" color="primary" v-close-popup :disabled="form.privacy_agreed !== 'Y'" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';
import { useEstimateStore } from '../stores/estimate';
import TermsOfService from '../components/TermsOfService.vue';

const $q = useQuasar();
const userStore = useUserStore();
const estimateStore = useEstimateStore();
const termsDialogOpen = ref(false);
const detailInput = ref(null);

const form = ref({
  user_id: null, customer_name: '', contact: '', postcode: '', address: '', 
  detailAddress: '', usage: '', budget: null, description: '', privacy_agreed: 'N'
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
watch(() => userStore.user, autoFill, { deep: true });

const openPostcode = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      form.value.postcode = data.zonecode;
      form.value.address = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      form.value.detailAddress = '';
      setTimeout(() => detailInput.value.focus(), 100);
    }
  }).open();
};

const handleOrder = async () => {
  if (!form.value.customer_name || !form.value.contact || !form.value.address || !form.value.usage || !form.value.budget) {
    return $q.notify({ color: 'warning', message: '필수 항목을 모두 입력해주세요.' });
  }
  const payload = { ...form.value, full_address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`.trim() };
  const success = await estimateStore.submitEstimate(payload);
  if (success) { $q.dialog({ title: '신청 완료', message: '견적 요청이 접수되었습니다.' }).onOk(() => location.reload()); }
};
</script>