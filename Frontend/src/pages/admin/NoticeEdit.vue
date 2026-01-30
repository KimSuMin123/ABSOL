<template>
  <q-page class="q-pa-md flex justify-center">
    <div style="max-width: 800px; width: 100%;">
      <div class="row items-center q-mb-md">
        <!-- <q-btn flat round icon="arrow_back" @click="$router.back()" /> -->
        <div class="text-h6 text-weight-bold">공지사항 수정</div>
      </div>

      <q-card flat bordered class="q-pa-md shadow-1" v-if="!loading">
        <q-form @submit="onUpdate" class="q-gutter-md">
          <div class="bg-orange-1 q-pa-sm rounded-borders border-orange-2">
            <q-checkbox 
              v-model="form.is_fixed" 
              label="이 글을 리스트 상단에 고정합니다" 
              color="orange-10" 
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
            label="내용"
            type="textarea"
            outlined
            rows="15"
            :rules="[val => !!val || '내용을 입력해주세요']"
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn label="취소" color="grey" flat @click="$router.back()" />
            <q-btn label="수정완료" type="submit" color="orange-8" unelevated :loading="submitting" />
          </div>
        </q-form>
      </q-card>
      
      <div v-else class="text-center q-pa-xl">
        <q-spinner-cube color="orange" size="40px" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const loading = ref(true);
const submitting = ref(false);

const form = ref({
  title: '',
  content: '',
  author: '',
  is_fixed: false
});

// 기존 데이터 불러오기
const fetchNotice = async () => {
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/notices/${route.params.id}`);
    if (res.data.success) {
      form.value = {
        title: res.data.data.title,
        content: res.data.data.content,
        author: res.data.data.author,
        is_fixed: res.data.data.is_fixed
      };
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '데이터를 가져오지 못했습니다.' });
    router.back();
  } finally {
    loading.value = false;
  }
};

const onUpdate = async () => {
  submitting.value = true;
  try {
    const res = await axios.patch(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/notices/${route.params.id}`, form.value);
    if (res.data.success) {
      $q.notify({ color: 'positive', message: '공지사항이 수정되었습니다.' });
      router.push(`/noti/${route.params.id}`); // 수정한 상세페이지로 이동
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '수정에 실패했습니다.' });
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchNotice);
</script>