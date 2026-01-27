<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1000px;">
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h5 text-weight-bold">Q&A 게시판</div>
        <q-btn color="primary" label="질문하기" icon="edit" @click="goToWrite" />
      </div>

      <q-card flat bordered class="shadow-1">
        <q-list separator>
          <q-item v-for="qna in qnaList" :key="qna.id" clickable v-ripple @click="goToDetail(qna.id)">
            <q-item-section side>
              <q-badge :color="qna.is_answered ? 'teal' : 'orange'" :label="qna.is_answered ? '답변완료' : '답변대기'" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ qna.title }}</q-item-label>
              <q-item-label caption>{{ qna.author }} • {{ formatDate(qna.createdAt) }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>

          <q-item v-if="qnaList.length === 0" class="text-center q-pa-xl text-grey-6">
            <q-item-section>데이터가 없습니다. 첫 질문을 등록해보세요!</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const qnaList = ref([]);

const loadQnas = async () => {
  try {
    const res = await axios.get('https://YOUR_API_URL/api/qna');
    qnaList.value = res.data;
  } catch (err) {
    console.error('Q&A 로드 실패', err);
  }
};

const goToWrite = () => router.push('/qna/write');
const goToDetail = (id) => router.push(`/qna/${id}`);
const formatDate = (date) => new Date(date).toLocaleDateString();

onMounted(loadQnas);
</script>