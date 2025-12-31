<template>
  <div v-if="repairs.length === 0" class="text-center q-pa-xl bg-white rounded-borders shadow-1">
    <q-icon name="build" size="64px" color="grey-4" />
    <div class="text-grey-6 q-mt-md">수리 이력이 없습니다.</div>
  </div>

  <q-card v-for="repair in repairs" :key="repair.repair_id" flat bordered class="q-mb-sm bg-white">
    <q-card-section>
      <div class="row justify-between items-center">
        <q-badge color="green">{{ repair.status || '접수완료' }}</q-badge>
        <div class="text-caption text-grey">{{ repair.createdAt.substring(0, 10) }}</div>
      </div>
      <div class="text-subtitle1 q-mt-sm text-weight-bold">{{ repair.symptoms }}</div>
      <div class="text-caption text-grey-8">{{ repair.repair_type }} | {{ repair.full_address }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import axios from 'axios';

const userStore = useUserStore();
const repairs = ref([]);

const loadRepairs = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/repairs/user/${userStore.user.id}`);
    repairs.value = res.data.data;
  } catch (e) { console.error(e); }
};

onMounted(loadRepairs);
</script>