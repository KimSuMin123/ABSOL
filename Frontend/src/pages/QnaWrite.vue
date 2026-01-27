<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px;">
      <div class="row items-center q-mb-md">
        <q-btn flat icon="arrow_back" @click="$router.back()" round color="grey-7" />
        <div class="text-h6 text-weight-bold q-ml-sm">질문하기</div>
      </div>

      <q-card flat bordered class="q-pa-lg shadow-1">
        <q-form @submit="onSubmit" class="q-gutter-y-md">
          
          <q-input
            v-model="form.title"
            label="제목"
            placeholder="질문의 요지를 간단히 입력해주세요"
            outlined
            dense
            :rules="[val => !!val || '제목을 입력해주세요']"
          />

          <q-input
            v-model="form.author"
            label="작성자"
            outlined
            dense
            :readonly="!!userStore.user"
            :rules="[val => !!val || '작성자 성함을 입력해주세요']"
          />

          <div class="row items-center q-gutter-x-sm">
            <q-checkbox v-model="form.is_private" label="비밀글로 작성하기" color="primary" />
            <q-icon name="help_outline" size="xs" color="grey-6">
              <q-tooltip>비밀글은 작성자와 관리자만 볼 수 있습니다.</q-tooltip>
            </q-icon>
          </div>

          <div>
            <div class="text-subtitle2 q-mb-xs text-grey-7">상세 내용</div>
            <q-editor
              v-model="form.content"
              min-height="15rem"
              :toolbar="[
                ['bold', 'italic', 'underline'],
                ['quote', 'unordered', 'ordered'],
                ['undo', 'redo']
              ]"
              content-class="bg-white"
            />
          </div>

          <div class="row q-col-gutter-sm q-mt-md">
            <div class="col-6">
              <q-btn outline label="취소" color="grey-7" class="full-width" @click="$router.back()" />
            </div>
            <div class="col-6">
              <q-btn label="등록하기" color="primary" class="full-width" type="submit" :loading="submitting" />
            </div>
          </div>

        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { useUserStore } from '../stores/user'; // 유저 정보 스토어 경로 확인

const router = useRouter();
const $q = useQuasar();
const userStore = useUserStore();

const submitting = ref(false);

const form = ref({
  title: '',
  author: '',
  content: '',
  is_private: false,
  user_id: null
});

// 초기 데이터 세팅 (로그인 유저인 경우)
onMounted(() => {
  if (userStore.user) {
    form.value.author = userStore.user.name;
    form.value.user_id = userStore.user.id;
  }
});

const onSubmit = async () => {
  if (!form.value.content || form.value.content === '<br>') {
    $q.notify({ color: 'negative', message: '내용을 입력해주세요.' });
    return;
  }

  submitting.value = true;
  try {
    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/qna', form.value);
    
    if (res.data.success) {
      $q.notify({ type: 'positive', message: '질문이 성공적으로 등록되었습니다.' });
      router.push('/qna'); // 목록 페이지로 이동
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '등록 중 오류가 발생했습니다.' });
    console.error(error);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.container {
  width: 100%;
}
</style>