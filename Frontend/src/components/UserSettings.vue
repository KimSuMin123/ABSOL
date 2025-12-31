<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-card flat bordered class="bg-white shadow-1">
        <q-card-section class="text-h6 text-weight-bold">내 정보 수정</q-card-section>
        <q-card-section class="q-gutter-y-sm">
          <q-input v-model="userStore.user.login_id" label="회원번호(ID)" filled readonly />
          <q-input v-model="editForm.name" label="성함" outlined dense />
          <q-input v-model="editForm.phone" label="연락처" mask="###-####-####" outlined dense />
          <q-input v-model="editForm.address" label="주소" outlined dense type="textarea" rows="2" />
          <q-btn label="수정 내용 저장" color="primary" class="full-width q-mt-md" unelevated @click="updateProfile" />
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-md-6">
      <q-card flat bordered class="bg-white shadow-1">
        <q-card-section class="text-h6 text-weight-bold text-primary">멤버십 플랜 업그레이드</q-card-section>
        <q-list separator>
          <q-item v-for="plan in planOptions" :key="plan.name" clickable v-ripple 
            @click="upgradePlan(plan)" :active="userStore.user.level === plan.name" active-class="bg-blue-1">
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ plan.name }}</q-item-label>
              <q-item-label caption>{{ plan.desc }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-subtitle1 text-weight-bolder text-primary">{{ plan.price.toLocaleString() }}원</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../stores/user';
import { useQuasar } from 'quasar';
import axios from 'axios';

const userStore = useUserStore();
const $q = useQuasar();
const editForm = ref({ ...userStore.user });

const planOptions = [
  { name: 'Basic', desc: '일반고객', price: 0 },
  { name: 'Standard', desc: '1년 부품 무상 보증', price: 33000 },
  { name: 'Green', desc: '관리상품 (구리스, 청소)', price: 55000 },
  { name: 'Silver', desc: '출장비 및 점검비 무료', price: 110000 },
  { name: 'Gold', desc: 'HDD 데이터 무료 복구', price: 165000 },
];

const updateProfile = async () => { /* ... (기존 API 로직) ... */ };
const upgradePlan = (plan) => { /* ... (기존 다이얼로그 로직) ... */ };
</script>