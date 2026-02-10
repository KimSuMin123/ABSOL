<template>
  <q-page class="flex flex-center q-pa-md bg-grey-2">
    <q-card style="width: 100%; max-width: 550px;" class="shadow-10">
      <q-card-section class="text-h6 bg-dark text-white text-center">
        ABSOL TECH 회원가입
      </q-card-section>

      <q-card-section class="q-gutter-y-md q-pt-lg">
        <div class="row q-gutter-x-sm items-center no-wrap">
          <q-input v-model="form.login_id" label="아이디" outlined dense class="col" :readonly="isIdChecked" @update:model-value="isIdChecked = false" />
          <q-btn :label="isIdChecked ? '확인됨' : '중복 확인'" :color="isIdChecked ? 'positive' : 'secondary'" @click="checkDuplicate" :outline="!isIdChecked" />
          <q-btn v-if="isIdChecked" icon="refresh" flat round dense @click="isIdChecked = false" />
        </div>

        <q-input v-model="form.password" type="password" label="비밀번호" outlined dense hint="8자 이상, 특수문자 포함" />
        <q-input v-model="form.confirm_password" type="password" label="비밀번호 확인" outlined dense />

        <q-input v-model="form.customer_name" label="이름" outlined dense />
        <q-input v-model="form.phone" label="전화번호" mask="###-####-####" outlined dense />

        <div class="row q-gutter-x-sm items-center no-wrap">
          <q-input v-model="form.postcode" label="우편번호" outlined dense readonly class="col-4" />
          <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline />
        </div>
        <q-input v-model="form.address" label="기본 주소" outlined dense readonly />
        <q-input v-model="form.detailAddress" label="상세 주소" outlined dense ref="detailInput" />

        <div class="q-pa-sm bg-grey-2 rounded-borders">
  <q-checkbox 
    v-model="form.privacy_agreed" 
    label="개인정보 수집 및 이용약관 동의 (필수)" 
    color="primary" 
    dense
    true-value="Y"
    false-value="N"
  />
  <q-btn 
    label="[내용보기]" 
    color="grey-7" 

    flat 
    dense 
    class="q-ml-xs"
    @click="termsDialogOpen = true" 
  />
</div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg q-px-md">
        <q-btn 
          v-if="form.privacy_agreed !== 'Y'"
          label="약관에 동의해 주세요" 
          color="grey-6" 
          class="full-width" 
          size="lg"
          @click="termsDialogOpen = true"
        />
        <q-btn 
          v-else
          label="회원가입 하기" 
          color="primary" 
          @click="submit" 
          class="full-width" 
          size="lg"
          :loading="submitting"
        />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="termsDialogOpen" persistent>
      <q-card style="width: 500px; max-width: 95vw;">
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
          />
          
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';
import TermsOfService from '../components/TermsOfService.vue';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const detailInput = ref(null);
const submitting = ref(false);
const isIdChecked = ref(false);
const termsDialogOpen = ref(false);

const form = ref({
  login_id: '',
  password: '', 
  confirm_password: '',
  customer_name: '',
  phone: '',
  postcode: '',
  address: '',
  detailAddress: '',
  privacy_agreed: 'N',
  region: '1', type: '1', productLine: '1'
});

// 아이디 중복 확인, 주소 API 로직은 동일... (생략 가능)
// 아이디 중복 확인
const checkDuplicate = async () => {
  if (!form.value.login_id) {
    $q.notify({ color: 'negative', message: '아이디를 입력해주세요.' });
    return;
  }
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/users/check-id/${form.value.login_id}`);
    if (res.data.isDuplicate) {
      $q.notify({ color: 'negative', message: '이미 사용 중인 아이디입니다.' });
      isIdChecked.value = false;
    } else {
      $q.notify({ color: 'positive', message: '사용 가능한 아이디입니다.' });
      isIdChecked.value = true;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '중복 확인 중 오류가 발생했습니다.' });
  }
};
// 카카오 주소 API
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
      setTimeout(() => detailInput.value.focus(), 100);
    }
  }).open();
};

// 제출 로직
const submit = async () => {
  if (!isIdChecked.value) return $q.notify({ color: 'warning', message: '아이디 중복 확인을 해주세요.' });
  if (form.value.password !== form.value.confirm_password) return $q.notify({ color: 'negative', message: '비밀번호가 다릅니다.' });
  
  submitting.value = true;
  try {
    const payload = { ...form.value, full_address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}` };
    await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/users/register', payload);
    $q.dialog({ title: '완료', message: '가입되었습니다.', ok: '확인' }).onOk(() => router.push('/'));
  } catch (e) {
    $q.notify({ color: 'negative', message: '가입 중 오류가 발생했습니다.' });
  } finally {
    submitting.value = false;
  }
};
</script>