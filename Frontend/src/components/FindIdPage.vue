<template>
  <q-page class="flex flex-center bg-grey-2 q-pa-md">
    <q-card flat bordered style="width: 100%; max-width: 400px; border-radius: 20px;" class="shadow-10">
      <q-card-section class="text-center q-pt-lg">
        <div class="text-h5 text-weight-bold">아이디 찾기</div>
        <div class="text-caption text-grey-7 q-mt-sm">가입 시 등록한 정보를 입력해 주세요.</div>
      </q-card-section>

      <q-card-section class="q-px-xl q-pb-lg">
        <q-form @submit="handleFindId" class="q-gutter-y-md">
          <q-input v-model="form.name" label="이름" outlined dense color="blue-7" :rules="[val => !!val || '이름을 입력하세요']" />
          <q-input v-model="form.phone" label="전화번호" outlined dense color="blue-7" mask="###-####-####" :rules="[val => !!val || '전화번호를 입력하세요']" />
          
          <q-btn label="아이디 찾기" type="submit" color="blue-7" class="full-width q-mt-md" unelevated />
          <q-btn label="로그인으로 돌아가기" flat color="grey-7" class="full-width" to="/login" />
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
const form = ref({ name: '', phone: '' });

const handleFindId = async () => {
  try {
    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/auth/find-id', form.value);
    if (res.data.success) {
      $q.dialog({
        title: '아이디 확인',
        message: `회원님의 아이디는 <b>${res.data.login_id}</b> 입니다.`,
        html: true,
        ok: { color: 'blue-7' }
      });
    }
  } catch (error) {
    $q.notify({ color: 'red-7', message: '일치하는 정보가 없습니다.' });
  }
};
</script>