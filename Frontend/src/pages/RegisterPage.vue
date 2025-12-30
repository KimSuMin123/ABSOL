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
            class="col-6" 
            outlined dense 
          />
       
        <q-input v-model="form.address" label="상세 주소" outlined dense placeholder="읍/면/동 상세주소를 입력하세요" />
        <div class="text-caption q-mt-md">거주 지역 </div>
        <div class="row q-gutter-x-md q-gutter-y-xs">
            <q-radio 
              v-for="r in regions" 
              :key="r.value" 
              v-model="form.region" 
              :val="r.value" 
              :label="r.label" 
              dense 
            />
          </div>

        <div class="text-caption q-mt-md">고객 유형 </div>
        <div class="row q-gutter-sm">
          <q-radio v-for="t in types" :key="t.value" v-model="form.type" :val="t.value" :label="t.label" dense />
        </div>

        <div class="text-caption q-mt-md">관심 상품 라인업</div>
        <div class="row q-gutter-md">
          <q-radio v-for="l in lines" :key="l.value" v-model="form.productLine" :val="l.value" :label="l.label" dense/>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn label="계정 생성 및 코드 발급" color="primary" @click="submit" class="full-width" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // useRouter 추가
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// 폼 데이터 초기값 (중복 선언 통합)
const form = ref({
  login_id: '',
  password: '', 
  customer_name: '',
  phone: '',
  address: '',
  region: '1',
  type: '1',
  productLine: '1'
});

// 선택 옵션 데이터
const regions = [
  { label: '서울', value: '1' }, { label: '경기', value: '2' }, { label: '인천', value: '3' },
  { label: '강원', value: '4' }, { label: '충남', value: '5' }, { label: '충북', value: '6' },
  { label: '경북', value: '7' }, { label: '경남', value: '8' }, { label: '전라', value: '9' }
];

const types = [
  { label: '수리', value: '1' }, { label: '본체구입', value: '2' }, { label: '부품', value: '3' },
  { label: '복구', value: '4' }, { label: '점검', value: '5' }, { label: '설치', value: '6' }, { label: '조립', value: '7' }
];

const lines = [
  { label: '일반', value: '1' }, { label: '사이드와인더', value: '2' },
  { label: '스패로우', value: '3' }, { label: '암람', value: '4' }
];

// 페이지 로드 시 비밀번호 자동 주입
onMounted(() => {
  if (route.query.pw) {
    form.value.password = route.query.pw;
  }
}); // <--- 누락되었던 괄호 닫기

// 등록 실행
const submit = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/users/register', form.value);
    alert(`회원가입 완료! 생성된 고객번호: ${res.data.customer_code}`);
    
    // 가입 완료 후 회원 관리 리스트로 이동 (선택 사항)
    router.push('/users');
  } catch (error) {
    console.error('등록 에러:', error);
    alert('등록 중 오류가 발생했습니다.');
  }
};
</script>