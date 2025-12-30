<template>
  <q-page class="flex flex-center q-pa-sm"> <q-card style="width: 100%; max-width: 500px;" flat bordered> <q-card-section class="q-pa-md"> <div class="text-h6 text-center q-mb-sm">PC 수리 요청</div> <q-form @submit="handleRepair" class="q-gutter-y-sm"> <q-input v-model="form.customer_name" label="성함" outlined dense />
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
            :label="form.repair_type === '방문수리' ? '방문 희망 주소' : '회수(택배) 주소'" 
            outlined dense 
            readonly 
            hide-bottom-space
          />
          
          <q-input 
            v-model="form.detailAddress" 
            label="상세 주소" 
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
            rows="3"
          />

          <div class="q-py-xs">
            <div class="text-subtitle2 q-mb-none">수리 방식 선택 <span class="text-red">*</span></div>
            <div class="row q-gutter-x-md">
              <q-radio v-model="form.repair_type" val="수리" label="매장 방문" color="primary" dense />
              <q-radio v-model="form.repair_type" val="방문수리" label="출장 수리" color="red-7" dense />
            </div>
            <div v-if="form.repair_type === '방문수리'" class="text-caption text-red-6 q-mt-xs text-weight-medium">
              <q-icon name="info" size="xs" /> 추가 비용(1만원~3만원)이 발생할 수 있습니다. 
            </div>
          </div>

          <div class="q-pa-sm bg-grey-1 rounded-borders border-grey-4">
            <q-checkbox 
              v-model="isAgreed" 
              label="개인정보 수집 및 이용 동의 (필수)" 
              color="primary"
              dense
            />
            <div class="text-caption text-grey-7 q-ml-md" style="font-size: 0.75rem;">
              * 상담 및 방문을 위해 고객 정보를 수집합니다.
            </div>
          </div>

          <q-btn 
            label="수리 신청하기" 
            type="submit" 
            color="primary" 
            class="full-width q-mt-sm"
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
  repair_type: '수리', // 기본값: 매장 방문
  customer_name: '',
  contact: '',
  postcode: '',
  address: '',
  detailAddress: '',
  symptoms: ''
});

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
  loading.value = true;
  try {
    const payload = {
      ...form.value,
      full_address: `(${form.value.postcode}) ${form.value.address} ${form.value.detailAddress}`
    };

    const res = await axios.post('http://localhost:3000/api/repairs', payload);
    
    if (res.data.success) {
      $q.dialog({
        title: '신청 완료',
        message: `${form.value.repair_type} 신청이 성공적으로 접수되었습니다.`,
      }).onOk(() => {
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