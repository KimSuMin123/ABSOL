<template>
  <q-page class="flex flex-center bg-grey-2 q-pa-md">
    <q-card flat bordered style="width: 100%; max-width: 400px; border-radius: 20px;" class="shadow-10">
      <q-card-section class="text-center q-pt-lg">
        <div class="text-h5 text-weight-bold">비밀번호 찾기</div>
        <div class="text-caption text-grey-7 q-mt-sm">본인 확인을 위해 아래 정보를 입력해 주세요.</div>
      </q-card-section>

      <q-card-section class="q-px-xl q-pb-lg">
        <q-form @submit="handleFindPw" class="q-gutter-y-md">
          <q-input v-model="form.name" label="이름" outlined dense color="red-7" />
          <q-input v-model="form.login_id" label="아이디" outlined dense color="red-7" />
          <q-input v-model="form.phone" label="전화번호" outlined dense color="red-7" mask="###-####-####" />
          
          <q-btn label="비밀번호 확인" type="submit" color="red-7" class="full-width q-mt-md" unelevated />
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
const form = ref({ name: '', login_id: '', phone: '' });

const handleFindPw = async () => {
  try {
    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/auth/find-pw', form.value);
    if (res.data.success) {
      $q.dialog({
        title: '비밀번호 안내',
        message: `회원님의 비밀번호는 <b>${res.data.password}</b> 입니다.<br>로그인 후 즉시 변경해 주세요.`,
        html: true,
        ok: { color: 'red-7' }
      });
    }
  } catch (error) {
    $q.notify({ color: 'red-7', message: '입력하신 정보가 일치하지 않습니다.' });
  }
};
</script>