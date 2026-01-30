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

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="grey-7" label="삭제" @click="deleteNotice" />
          <q-btn flat color="teal" label="수정" :to="`/admin/notice/edit/${notice.notice_id}`" />
        </q-card-actions>
      </q-card>
    </div>

    <div v-else-if="loading" class="flex flex-center">
      <q-spinner-comment color="teal" size="50px" />
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
const notice = ref(null);
const loading = ref(true);

const fetchDetail = async () => {
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/notices/${route.params.id}`);
    if (res.data.success) {
      notice.value = res.data.data;
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '글을 불러올 수 없습니다.' });
    router.back();
  } finally {
    loading.value = false;
  }
};

const deleteNotice = () => {
  $q.dialog({
    title: '삭제 확인',
    message: '이 공지사항을 정말 삭제하시겠습니까?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.delete(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/notices/${notice.value.notice_id}`);
      $q.notify({ color: 'positive', message: '삭제되었습니다.' });
      router.push('/notice');
    } catch (err) {
      $q.notify({ color: 'negative', message: '삭제 실패' });
    }
  });
};

const formatDate = (date) => date ? date.substring(0, 16).replace('T', ' ') : '';

onMounted(fetchDetail);
</script>

<style scoped>
.notice-content {
  min-height: 300px;
  color: #333;
}
</style>