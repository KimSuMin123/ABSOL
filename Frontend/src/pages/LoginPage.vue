<template>
  <q-page class="flex flex-center bg-grey-2 q-pa-md">
    <div class="row q-col-gutter-lg items-stretch" style="max-width: 1000px; width: 100%;">
      
      <div class="col-12 col-md-5">
        <q-card flat bordered class="full-height shadow-10" style="border-radius: 20px;">
          <q-card-section class="text-center q-pt-xl">
            <div class="text-h3 text-weight-bolder q-mb-md">
              <span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>
              <span class="text-h5 q-ml-xs text-grey-5 text-weight-light">TECH</span>
              </div>
              <div>
              <span class="text-subtitle2 text-grey-8"> pc 조립 | pc 수리 | 데이터복구</span>
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
              <div class="row justify-center q-gutter-x-sm q-mt-md">
  <q-btn flat no-caps label="아이디 찾기" color="grey-7" size="sm" to="/find-id" />
  <q-separator vertical inset />
  <q-btn flat no-caps label="비밀번호 찾기" color="grey-7" size="sm" to="/find-pw" />
</div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

 <div class="col-12 col-md-7 column q-gutter-y-md justify-center">
  <q-card flat bordered class="bg-grey-3 q-pa-md" style="border-radius: 10px;">
    <div class="row items-center justify-between no-wrap q-mb-sm">
      <div class="text-h5 text-weight-bold">견적 요청(비회원)</div>
      <q-icon name="calculate" size="64px" color="grey-6" />
    </div>
    
    <div class="row items-center">
      <q-btn label="신청하기" color="grey-8" unelevated @click="goToGuest('estimate')" />
    </div>
  </q-card>

  <q-card flat bordered class="bg-grey-3 q-pa-md" style="border-radius: 10px;">
    <div class="row items-center justify-between no-wrap q-mb-sm">
      <div class="text-h5 text-weight-bold">수리 신청(비회원)</div>
      <q-icon name="build_circle" size="64px" color="grey-6" />
    </div>

    <div class="row items-center">
      <q-btn label="신청하기" color="grey-8" unelevated @click="goToGuest('repair')" />
    </div>
  </q-card>
    <q-card flat bordered class="bg-grey-3 q-pa-md" style="border-radius: 10px;">
    <div class="row items-center justify-between no-wrap q-mb-sm">
      <div class="text-h5 text-weight-bold">데이터 복구 신청(비회원)</div>
      <q-icon name="save" size="64px" color="grey-6" />
    </div>

    <div class="row items-center">
      <q-btn label="신청하기" color="grey-8" unelevated @click="goToGuest('datarepair')" />
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
    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/auth/login', loginData.value);
    
    if (res.data.success) {
      authStore.login(res.data.user, res.data.token);
      $q.notify({ color: 'blue-7', message: `${res.data.user.name}님 환영합니다!`, icon: 'check' });
      
      // 관리자 여부 체크 (DB의 역할 필드명이 role이라고 가정)
      // 만약 필드명이 isAdmin(boolean)이라면 res.data.user.isAdmin === true 등으로 체크하세요.
      if (res.data.user.login_id === 'admin') {
        window.location.href = '/admin'; 
      } else {
        window.location.href = '/order'; 
      }
    }
  }catch (error) {
    $q.notify({ color: 'red-7', message: '로그인 정보가 일치하지 않습니다.' });
  }
};

const goToGuest = (type) => {
  if (type === 'estimate') {
    router.push('/estimate');
  } else if (type === 'repair') {
    router.push('/repairs');
  } else if (type === 'datarepair') {
    router.push('/datarepair'); // 데이터 복구 전용 경로
  }
};
</script>

<style scoped>
.full-height { height: 100%; }
.shadow-10 { box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; }
</style>