<template>
  <div class="q-gutter-y-sm">
    <div class="row q-gutter-x-sm no-wrap">
      <q-input v-model="phone" label="전화번호" mask="###-####-####" outlined dense class="col" :readonly="isDone" />
      <q-btn :label="isDone ? '인증완료' : '인증발송'" :color="isDone ? 'positive' : 'black'" @click="sendOtp" :disable="isDone" />
    </div>
    <div v-if="sent && !isDone" class="row q-gutter-x-sm no-wrap">
      <q-input v-model="code" label="인증번호" outlined dense class="col" mask="######" />
      <q-btn label="확인" color="primary" @click="verify" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
const emit = defineEmits(['success']);
const phone = ref(''); const code = ref('');
const sent = ref(false); const isDone = ref(false); const loading = ref(false);

const sendOtp = async () => {
  const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/sms/send-otp', { phone: phone.value.replace(/-/g, '') });
  if (res.data.success) sent.value = true;
};

const verify = async () => {
  loading.value = true;
  const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/sms/verify-otp', { phone: phone.value.replace(/-/g, ''), code: code.value });
  if (res.data.success) {
    isDone.value = true;
    emit('success', phone.value);
  }
  loading.value = false;
};
</script>