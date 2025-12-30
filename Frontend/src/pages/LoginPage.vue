<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card style="width: 400px; border-radius: 20px;" class="shadow-15">
      <q-card-section class="bg-white text-center q-pa-xl border-bottom">
        <div class="text-h4 text-weight-bolder q-mb-xs">
          <span class="text-blue-7">Ab</span><span class="text-red-7">SoL</span><span class="text-grey-7">Tech</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-xl">
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input v-model="loginData.login_id" label="아이디" outlined dense autofocus color="blue-7" />
          <q-input v-model="loginData.password" type="password" label="비밀번호" outlined dense color="blue-7" />
          
          <div class="row q-col-gutter-md q-mt-lg">
            <div class="col-6">
              <q-btn label="로그인" type="submit" color="blue-7" class="full-width text-weight-bold" size="lg" unelevated />
            </div>
            <div class="col-6">
              <q-btn label="회원가입" outline color="red-7" class="full-width text-weight-bold" size="lg" @click="$router.push('/register')" />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();
const loginData = ref({ login_id: '', password: '' });

const handleLogin = async () => {
  if (!loginData.value.login_id || !loginData.value.password) {
    $q.notify({ color: 'warning', message: '아이디와 비밀번호를 입력해주세요.' });
    return;
  }

  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', loginData.value);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      $q.notify({ color: 'blue-7', message: `${res.data.user.name}님 환영합니다!`, icon: 'check' });

      // [핵심 로직] 아이디에 따른 페이지 분기
      if (res.data.user.login_id === 'admin') {
        router.push('/admin/orders');
      } else {
        router.push('/');
      }
    }
  } catch (error) {
    $q.notify({ color: 'red-7', message: error.response?.data?.message || '로그인 실패' });
  }
};
</script>

<style scoped>
.border-bottom { border-bottom: 1px solid #f0f0f0; }
.shadow-15 { box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
</style>