<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px;">
      <q-btn flat icon="arrow_back" label="목록으로" color="grey-7" @click="$router.push('/qna')" class="q-mb-md" />

      <q-card v-if="qna" flat bordered class="shadow-1">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <q-badge :color="qna.is_answered ? 'teal' : 'orange'" size="md">
              {{ qna.is_answered ? '답변완료' : '답변대기' }}
            </q-badge>
            <div class="text-caption text-grey-7">{{ formatDate(qna.createdAt) }}</div>
          </div>
          <div class="text-h5 text-weight-bold q-mb-sm">{{ qna.title }}</div>
          <div class="text-subtitle2 text-grey-8 q-mb-xl">작성자: {{ qna.author }}</div>
          <q-separator q-my-md />
          <div class="q-my-xl text-body1" style="white-space: pre-line;" v-html="qna.content"></div>
        </q-card-section>

        <q-card-section v-if="qna.answer" class="bg-blue-grey-1 q-pa-lg border-top-dashed">
          <div class="row items-center q-mb-sm text-primary">
            <q-icon name="subdirectory_arrow_right" size="sm" class="q-mr-xs" />
            <div class="text-subtitle1 text-weight-bold">관리자 답변</div>
          </div>
          <div class="text-body1 text-grey-9" style="white-space: pre-line;">{{ qna.answer }}</div>
        </q-card-section>

        <q-card-section v-if="isAdmin" class="bg-grey-2 q-pa-lg">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">관리자 답변 {{ qna.answer ? '수정' : '등록' }}</div>
          <q-input
            v-model="answerInput"
            type="textarea"
            filled
            bg-color="white"
            placeholder="답변 내용을 입력하세요..."
            rows="5"
          />
          <div class="row justify-end q-mt-sm">
            <q-btn 
              :label="qna.answer ? '답변 수정하기' : '답변 등록하기'" 
              color="primary" 
              :loading="saving"
              @click="saveAnswer" 
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { useUserStore } from '../stores/user';

const route = useRoute();
const $q = useQuasar();
const userStore = useUserStore();

const qna = ref(null);
const answerInput = ref('');
const saving = ref(false);

// 관리자 권한 체크 (본인의 관리자 조건에 맞게 수정하세요)
const isAdmin = computed(() => {
  return userStore.user?.role === 'admin' || userStore.user?.id === 1; 
});

const loadDetail = async () => {
  try {
    const res = await axios.get(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/qna/${route.params.id}`);
    if (res.data.success) {
      qna.value = res.data.data;
      answerInput.value = qna.value.answer || ''; // 기존 답변이 있으면 입력창에 채움
    }
  } catch (err) {
    console.error('상세 로드 실패', err);
  }
};

const saveAnswer = async () => {
  if (!answerInput.value) return $q.notify({ color: 'negative', message: '답변을 입력해주세요.' });

  saving.value = true;
  try {
    const res = await axios.patch(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/qna/answer/${qna.value.qna_id}`, {
      answer: answerInput.value
    });
    
    if (res.data.success) {
      $q.notify({ type: 'positive', message: '답변이 저장되었습니다.' });
      loadDetail(); // 화면 갱신
    }
  } catch (err) {
    $q.notify({ color: 'negative', message: '답변 저장 실패' });
  } finally {
    saving.value = false;
  }
};

const formatDate = (date) => new Date(date).toLocaleString();
onMounted(loadDetail);
</script>