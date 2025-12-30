<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card style="width: 100%; max-width: 550px;" flat bordered>
      <q-card-section>
        <div class="text-h6 text-center q-mb-md">PC 수리 요청</div>
        
        <q-form @submit="handleRepair" class="q-gutter-md">
          <q-input v-model="form.customer_name" label="성함" outlined dense />
          <q-input v-model="form.contact" label="연락처" mask="###-####-####" outlined dense />
          
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
            label="방문/회수 주소" 
            outlined dense 
            readonly 
            hint="주소 검색을 이용해 주세요." 
          />
          
          <q-input 
            v-model="form.detailAddress" 
            label="상세 주소 (호수, 사무실 번호 등)" 
            outlined dense 
            placeholder="상세 주소를 입력하세요" 
            ref="detailInput"
          />

          <q-input
            v-model="form.symptoms"
            type="textarea"
            label="고장 증상 (최대 200자)"
            maxlength="200"
            counter outlined dense
          />

          <div class="q-pa-sm bg-grey-1 rounded-borders border-grey-4">
            <q-checkbox 
              v-model="isAgreed" 
              label="개인정보 수집 및 이용 동의 (필수)" 
              color="primary"
            />
            <div class="text-caption text-grey-7 q-ml-md">
              * 원활한 수리 상담 및 방문을 위해 성함, 연락처, 주소 정보를 수집합니다.
            </div>
          </div>

          <q-btn 
            label="수리 신청하기" 
            type="submit" 
            color="primary" 
            class="full-width"
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
import { ref } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const isAgreed = ref(false);
const loading = ref(false);
const detailInput = ref(null);

const form = ref({
  customer_name: '',
  contact: '',
  postcode: '',      // 추가
  address: '',       // 기본 주소
  detailAddress: '', // 상세 주소
  symptoms: ''
});

// 카카오 주소 검색 함수
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
      // 주소 선택 후 상세주소 창으로 포커스 이동
      setTimeout(() => detailInput.value.focus(), 100);
    }
  }).open();
};

const handleRepair = async () => {
  loading.value = true; // .ref 대신 .value 사용
  try {
    // 백엔드에 보낼 때는 주소를 하나로 합쳐서 전달
    const payload = {
      ...form.value,
      full_address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`
    };

    const res = await axios.post('http://localhost:3000/api/repairs', payload);
    
    if (res.data.success) {
      $q.dialog({
        title: '신청 완료',
        message: '수리 신청이 성공적으로 접수되었습니다.',
      }).onOk(() => {
        // 성공 시 초기화 혹은 페이지 이동
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