<template>
  <q-page class="q-pa-md flex justify-center">
    <div style="max-width: 800px; width: 100%;">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">공지사항 작성</div>
      </div>

      <q-card flat bordered class="q-pa-md shadow-1">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="bg-teal-1 q-pa-sm rounded-borders">
            <q-checkbox 
              v-model="form.is_fixed" 
              label="이 글을 리스트 상단에 고정합니다" 
              color="teal" 
              dense
            />
          </div>

          <q-input
            v-model="form.title"
            label="제목"
            outlined
            dense
            :rules="[val => !!val || '제목을 입력해주세요']"
          />

          <q-input
            v-model="form.author"
            label="작성자"
            outlined
            dense
          />

          <q-input
            v-model="form.content"
            label="내용을 입력하세요"
            type="textarea"
            outlined
            rows="15"
            :rules="[val => !!val || '내용을 입력해주세요']"
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn label="취소" color="grey" flat v-close-popup @click="$router.back()" />
            <q-btn label="등록하기" type="submit" color="teal" unelevated :loading="submitting" />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();
const submitting = ref(false);

const form = ref({
  title: '',
  content: '',
  author: '관리자',
  is_fixed: false
});

const onSubmit = async () => {
  submitting.value = true;
  try {
    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/notices', form.value);
    if (res.data.success) {
      $q.notify({ color: 'positive', message: '공지사항이 등록되었습니다.' });
      router.push('/noti'); // 등록 후 목록으로 이동
    }
  } catch (err) {
    console.error(err);
    $q.notify({ color: 'negative', message: '등록에 실패했습니다.' });
  } finally {
    submitting.value = false;
  }
};
</script>