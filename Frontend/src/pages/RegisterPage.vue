<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card style="width: 100%; max-width: 550px;">
      <q-card-section class="text-h6 bg-dark text-white">
        ABSOL TECH 회원가입
      </q-card-section>

      <q-card-section class="q-gutter-sm">
        <q-input v-model="form.login_id" label="아이디" outlined dense />
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
        />

    
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn label="계정 생성 및 코드 발급" color="primary" @click="submit" class="full-width" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// 폼 데이터 초기값 (주소 관련 필드 추가)
const form = ref({
  login_id: '',
  password: '', 
  customer_name: '',
  phone: '',
  postcode: '',      // 우편번호 추가
  address: '',       // 기본 주소
  detailAddress: '', // 상세 주소 추가
  region: '1',
  type: '1',
  productLine: '1'
});

// 카카오 주소 API 실행 함수
const openPostcode = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      // 도로명 주소와 지번 주소 중 선택한 값에 따라 처리
      let fullAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      let extraAddr = '';

      if (data.userSelectedType === 'R') {
        if (data.bname !== '') extraAddr += data.bname;
        if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName);
        fullAddr += (extraAddr !== '' ? ` (${extraAddr})` : '');
      }

      form.value.postcode = data.zonecode; // 우편번호 저장
      form.value.address = fullAddr;       // 기본 주소 저장
      // 상세 주소 입력창으로 포커스 이동 (선택 사항)
    }
  }).open();
};


onMounted(() => {
  if (route.query.pw) {
    form.value.password = route.query.pw;
  }
});

const submit = async () => {
  try {
    // 최종 주소 합치기 (필요에 따라 백엔드에서 따로 받아도 됨)
    const payload = {
      ...form.value,
      full_address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`
    };
    
    const res = await axios.post('http://localhost:3000/api/users/register', payload);
    alert(`회원가입을 축하합니다!`);
    router.push('/login');
  } catch (error) {
    console.error('등록 에러:', error);
    alert('등록 중 오류가 발생했습니다.');
  }
};
</script>