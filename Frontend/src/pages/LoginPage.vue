<template>
  <q-page class="flex flex-center bg-grey-2 q-pa-md">
    <div class="row q-col-gutter-lg items-stretch" style="max-width: 1000px; width: 100%;">
      
      <div class="col-12 col-md-5">
        <q-card flat bordered class="full-height shadow-10" style="border-radius: 20px;">
          <q-card-section class="text-center q-pt-xl">
            <div class="text-h3 text-weight-bolder q-mb-md">
              <span class="text-blue-7">Ab</span> <span class="text-red-7">SoL</span>
            </div>
          </q-card-section>

          <q-card-section class="q-px-xl q-pb-xl">
            <q-form @submit="handleLogin" class="q-gutter-y-md">
              <q-input v-model="loginData.login_id" label="아이디" outlined dense bg-color="grey-3" color="blue-7" />
              <q-input v-model="loginData.password" type="password" label="비밀번호" outlined dense bg-color="grey-3" color="blue-7" />
              
              <div class="row q-col-gutter-sm q-mt-lg">
                <div class="col-6">
                  <q-btn label="로그인" type="submit" color="blue-7" class="full-width text-weight-bold" unelevated />
                </div>
                <div class="col-6">
                  <q-btn label="회원가입" color="red-7" outline class="full-width text-weight-bold" @click="$router.push('/register')" />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7 column q-gutter-y-md">
        <q-card flat bordered class="bg-grey-3 flex-center q-pa-lg" style="border-radius: 10px; flex: 1;">
          <div class="text-h5 text-weight-bold q-mb-xl">견적 요청(비회원)</div>
          <div class="row items-center">
            <q-btn label="신청하기" color="grey-8" unelevated @click="goToGuest('estimate')" />
          </div>
        </q-card>

        <q-card flat bordered class="bg-grey-3 flex-center q-pa-lg" style="border-radius: 10px; flex: 1;">
          <div class="text-h5 text-weight-bold q-mb-xl">수리 및 복구(비회원)</div>
          <div class="row items-center">

            <q-btn label="신청하기" color="grey-8" unelevated @click="goToGuest('repair')" />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const loginData = ref({ login_id: '', password: '' });
const agreement = reactive({
  estimate: false,
  repair: false
});

// 로그인 처리
const handleLogin = async () => {
  if (!loginData.value.login_id || !loginData.value.password) {
    $q.notify({ color: 'warning', message: '아이디와 비밀번호를 입력해주세요.' });
    return;
  }
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', loginData.value);
    if (res.data.success) {
      authStore.login(res.data.user, res.data.token);
      $q.notify({ color: 'blue-7', message: `${res.data.user.name}님 환영합니다!`, icon: 'check' });
      
      // [핵심 수정] 로그인 성공 시 무조건 /order 페이지로 이동
      // 관리자 여부와 관계없이 상품구매(order) 페이지로 보냅니다.
      router.push('/order'); 
    }
  } catch (error) {
    $q.notify({ color: 'red-7', message: '로그인 정보가 일치하지 않습니다.' });
  }
};

const goToGuest = (type) => {
  router.push(type === 'estimate' ? '/estimate' : '/repairs');
};
</script>

<style scoped>
.full-height { height: 100%; }
.shadow-10 { box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; }
</style>