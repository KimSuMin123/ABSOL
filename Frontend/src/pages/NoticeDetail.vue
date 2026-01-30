<template>
  <q-page class="q-pa-md flex justify-center">
    <div style="max-width: 900px; width: 100%;" v-if="notice">
      <div class="q-mb-md">
        <q-btn flat color="grey-7" icon="arrow_back" label="목록으로" @click="$router.back()" />
      </div>

      <q-card flat bordered class="shadow-2 rounded-borders">
        <q-card-section class="bg-grey-1 q-pa-lg">
          <div class="row items-center q-gutter-x-sm q-mb-sm" v-if="notice.is_fixed">
            <q-badge color="orange" label="중요 공지" />
          </div>
          <div class="text-h5 text-weight-bolder text-dark">{{ notice.title }}</div>
          
          <div class="row items-center text-grey-7 q-mt-md text-caption q-gutter-x-md">
            <div class="row items-center"><q-icon name="person" class="q-mr-xs" />{{ notice.author }}</div>
            <div class="row items-center"><q-icon name="schedule" class="q-mr-xs" />{{ formatDate(notice.createdAt) }}</div>
            <div class="row items-center"><q-icon name="visibility" class="q-mr-xs" />조회수 {{ notice.view_count }}</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-xl text-body1 notice-content">
          <div style="white-space: pre-wrap; line-height: 1.8;">{{ notice.content }}</div>
        </q-card-section>

        <template v-if="authStore.isAdmin">
          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat color="negative" label="삭제" @click="deleteNotice" />
            <q-btn flat color="teal" label="수정" :to="`/admin/noti/edit/${notice.notice_id}`" />
          </q-card-actions>
        </template>
      </q-card>
    </div>

    <div v-else-if="loading" class="flex flex-center" style="min-height: 400px;">
      <q-spinner-comment color="teal" size="50px" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth'; // useAuthStore로 변경

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore(); // auth 스토어 사용

const notice = ref(null);
const loading = ref(true);

const fetchDetail = async () => {
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/notices/${route.params.id}`);
    if (res.data.success) {
      notice.value = res.data.data;
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '데이터를 불러오는 중 오류가 발생했습니다.' });
    router.push('/noti');
  } finally {
    loading.value = false;
  }
};

const deleteNotice = () => {
  $q.dialog({
    title: '공지 삭제',
    message: '이 공지사항을 정말 삭제하시겠습니까?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.delete(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/notices/${notice.value.notice_id}`);
      $q.notify({ color: 'positive', message: '성공적으로 삭제되었습니다.' });
      router.push('/noti');
    } catch (err) {
      $q.notify({ color: 'negative', message: '삭제 실패' });
    }
  });
};

const formatDate = (date) => date ? date.substring(0, 16).replace('T', ' ') : '';

onMounted(fetchDetail);
</script>