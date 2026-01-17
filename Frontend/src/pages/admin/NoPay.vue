<template>
  <q-page class="q-pa-md flex flex-center bg-grey-1">
    <q-card style="width: 100%; max-width: 600px" class="shadow-2">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">신규 제품 등록</div>
      </q-card-section>

      <q-form @submit="onSubmit" class="q-gutter-md q-pa-lg">

        <q-input
          v-model="form.product_name"
          label="제품명 *"
          outlined
          dense
          :rules="[val => !!val || '제품명을 입력해주세요']"
        />

      
          <q-input
            class="col-6"
            v-model.number="form.product_price"
            type="number"
            label="가격 (원) *"
            outlined
            dense
            :rules="[val => val >= 0 || '가격을 확인해주세요']"
          />

        <q-input
          v-model="form.hardware_info"
          label="하드웨어 사양 (CPU, RAM 등)"
          outlined
          dense
          placeholder="예: i5-12400 / 16GB / RTX 3060"
        />

        <q-input
          v-model="form.description"
          type="textarea"
          label="상세 설명"
          outlined
          dense
        />

        <q-card-actions align="right" class="q-px-none">
          <q-btn label="취소" flat color="grey" v-close-popup />
          <q-btn label="제품 등록하기" type="submit" color="primary" :loading="submitting" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

const submitting = ref(false);
const imageFile = ref(null);
const imageUrl = ref(null);

const form = reactive({
  product_name: '',
  product_price: 0,
  stock: 1,
  is_used: false,
  show: 'no',
  hardware_info: '',
  description: ''
});


const onSubmit = async () => {
  submitting.value = true;
  
  try {
    const formData = new FormData();
    
    // 1. 일반 필드 추가
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });

    const response = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success) {
      $q.notify({
        color: 'positive',
        message: '제품이 성공적으로 등록되었습니다.',
        icon: 'check'
      });
      router.push('/admin/product'); // 등록 후 목록으로 이동
    }
  } catch (error) {
    console.error(error);
    $q.notify({
      color: 'negative',
      message: '등록 실패: ' + (error.response?.data?.message || '네트워크 오류'),
      icon: 'report_problem'
    });
  } finally {
    submitting.value = false;
  }
};
</script>