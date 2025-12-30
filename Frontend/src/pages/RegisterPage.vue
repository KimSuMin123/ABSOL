<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card style="width: 100%; max-width: 550px;">
      <q-card-section class="text-h6 bg-dark text-white">
        ABSOL TECH 회원가입
      </q-card-section>

      <q-card-section class="q-gutter-sm">
        <div class="row q-gutter-x-sm items-center no-wrap">
          <q-input 
            v-model="form.login_id" 
            label="아이디" 
            outlined dense 
            class="col"
            :readonly="isIdChecked"
            placeholder="아이디를 입력하세요"
            @update:model-value="isIdChecked = false"
          />
          <q-btn 
            :label="isIdChecked ? '확인됨' : '중복 확인'" 
            :color="isIdChecked ? 'positive' : 'secondary'" 
            @click="checkDuplicate" 
            :outline="!isIdChecked"
            class="col-auto" 
          />
          <q-btn 
            v-if="isIdChecked" 
            icon="refresh" 
            flat 
            round 
            dense 
            @click="isIdChecked = false" 
          />
        </div>

        <q-input v-model="form.password" type="password" label="비밀번호" outlined dense />
        <q-input v-model="form.customer_name" label="이름" outlined dense />
        
        <q-input 
          v-model="form.phone" 
          label="전화번호" 
          mask="###-####-####" 
          placeholder="010-0000-0000"
          outlined dense 
        />

        <div class="row q-gutter-x-sm items-center no-wrap">
          <q-input 
            v-model="form.postcode" 
            label="우편번호" 
            outlined dense 
            readonly 
            class="col-4"
          />
          <q-btn label="주소 검색" color="secondary" @click="openPostcode" outline class="col-auto" />
        </div>
        
        <q-input 
          v-model="form.address" 
          label="기본 주소" 
          outlined dense 
          readonly 
          placeholder="주소 검색을 이용해주세요" 
        />
        
        <q-input 
          v-model="form.detailAddress" 
          label="상세 주소" 
          outlined dense 
          placeholder="상세 주소를 입력하세요" 
          ref="detailInput"
        />

        
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn 
          label="계정 생성 및 고객코드 발급" 
          color="primary" 
          @click="submit" 
          class="full-width" 
          size="lg"
          :loading="submitting"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const detailInput = ref(null);
const submitting = ref(false);
const isIdChecked = ref(false);

const form = ref({
  login_id: '',
  password: '', 
  customer_name: '',
  phone: '',
  postcode: '',
  address: '',
  detailAddress: '',
  region: '1',
  type: '1',
  productLine: '1'
});


// 아이디 중복 확인
const checkDuplicate = async () => {
  if (!form.value.login_id) {
    $q.notify({ color: 'negative', message: '아이디를 입력해주세요.' });
    return;
  }
  try {
    const res = await axios.get(`http://localhost:3000/api/users/check-id/${form.value.login_id}`);
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

onMounted(() => {
  if (route.query.pw) form.value.password = route.query.pw;
});

// 회원가입 제출
const submit = async () => {
  if (!isIdChecked.value) {
    $q.notify({ color: 'warning', message: '아이디 중복 확인을 먼저 완료해주세요.' });
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      ...form.value,
      full_address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`
    };
    
    const res = await axios.post('http://localhost:3000/api/users/register', payload);
    
    $q.dialog({
      title: '가입 완료',
      message: `회원가입을 축하드립니다.`,
      ok: '로그인하러 가기'
    }).onOk(() => {
      router.push('/login');
    });

  } catch (error) {
    console.error(error);
    $q.notify({ color: 'negative', message: '등록 중 오류가 발생했습니다: ' + (error.response?.data?.message || error.message) });
  } finally {
    submitting.value = false;
  }
};
</script>