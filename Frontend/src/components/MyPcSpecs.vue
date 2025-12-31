<template>
  <q-card flat bordered class="bg-white q-pa-md shadow-1">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 font-weight-bold">
        <q-icon name="computer" color="primary" size="sm" class="q-mr-sm" />
        보유 PC 사양
      </div>
      <q-btn flat round color="grey-7" icon="refresh" size="sm" @click="loadMyPc" />
    </div>

    <div v-if="myPc" class="row q-col-gutter-md">
      <div 
        class="col-12 col-sm-6" 
        v-for="(val, key) in myPcSpecs" 
        :key="key"
      >
        <q-item class="bg-grey-1 rounded-borders q-pa-sm">
          <q-item-section avatar>
            <q-avatar color="white" text-color="primary" size="md">
              <q-icon :name="getIcon(key)" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label caption class="text-uppercase">{{ key }}</q-item-label>
            <q-item-label class="text-weight-bold">{{ val || '정보 없음' }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>

    <div v-else class="text-center q-py-xl">
      <q-icon name="monitor_heart" size="64px" color="grey-3" />
      <div class="text-grey-6 q-mt-md">등록된 PC 정보가 없습니다.</div>
      <q-btn outline color="primary" label="PC 등록하기" class="q-mt-md" size="sm" />
    </div>
  </q-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import axios from 'axios';

const userStore = useUserStore();
const myPc = ref(null);

// 기본값 세팅 (DB에서 가져오기 전 또는 없을 때 노출)
const myPcSpecs = reactive({
  cpu: '',
  gpu: '',
  ram: '',
  ssd: '',
  mb: '', // 메인보드
  psu: '' // 파워
});

// 하드웨어 종류별 아이콘 매칭
const getIcon = (key) => {
  const icons = {
    cpu: 'memory',
    gpu: 'videogame_asset',
    ram: 'straighten',
    ssd: 'storage',
    mb: 'developer_board',
    psu: 'settings_input_component'
  };
  return icons[key] || 'settings';
};

const loadMyPc = async () => {
  if (!userStore.user.id) return;
  
  try {
    const res = await axios.get(`http://localhost:3000/api/mypc/user/${userStore.user.id}`);
    if (res.data.data) {
      myPc.value = res.data.data;
      // API 응답 데이터를 reactive 객체에 매핑
      Object.assign(myPcSpecs, {
        cpu: res.data.data.cpu,
        gpu: res.data.data.gpu,
        ram: res.data.data.ram,
        ssd: res.data.data.ssd,
        mb: res.data.data.mainboard,
        psu: res.data.data.power
      });
    }
  } catch (e) {
    console.error('MyPC 로드 실패:', e);
  }
};

onMounted(loadMyPc);
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.q-item {
  transition: background 0.3s;
}
.q-item:hover {
  background: #eceff1 !important;
}
</style>