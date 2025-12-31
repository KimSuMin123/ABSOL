<template>
  <q-dialog v-model="visible" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bg-grey-2">
      
        <div class="text-h6 text-weight-bold q-px-md q-py-md">{{ customerName }} 고객님 기기 통합 관리 (총 {{ pcList.length }}대)
       
        <q-btn flat label="새 기기 즉시 추가" icon="add" class="q-ml-xl" @click="addNewPcEntry" />
        <q-btn dense flat icon="close" class="q-ml-xl" v-close-popup />
 </div>
      <q-card-section class="q-pa-md scroll" style="max-height: 92vh">
        <div v-if="pcList.length === 0" class="flex flex-center q-pa-xl bg-white rounded-borders border-dashed" style="height: 400px">
          <div class="text-center">
            <q-icon name="monitor" size="100px" color="grey-3" />
            <div class="text-h5 text-grey-5 q-mt-md">등록된 PC 정보가 없습니다.</div>
            <q-btn color="primary" label="첫 번째 기기 등록하기" class="q-mt-md" @click="addNewPcEntry" />
          </div>
        </div>

        <div v-else class="column q-gutter-y-lg">
          <q-card v-for="(pc, index) in pcList" :key="pc.mypc_id || `temp-${index}`" flat bordered class="shadow-2 bg-white">
            <q-card-section class="row items-center bg-blue-grey-1 q-py-sm">
              <q-badge color="blue-10" :label="`No.${index + 1}`" class="q-mr-sm" />
              <q-input v-model="pc.pc_nickname" dense borderless class="text-h6 text-weight-bolder col" placeholder="기기 별칭 입력" />
              <q-space />
              <q-btn color="positive" icon="save" label="저장" flat @click="savePc(pc)" />
              <q-btn color="red-7" icon="delete" label="삭제" flat @click="confirmDelete(pc, index)" />
            </q-card-section>

            <q-card-section class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div v-for="part in partsConfig" :key="part.key" class="col-12 col-sm-6 col-md-4">
                  <div class="bg-grey-1 q-pa-sm rounded-borders border-light">
                    <div class="row items-center q-mb-xs">
                      <q-icon :name="part.icon" size="xs" color="grey-7" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">{{ part.label }}</span>
                      <q-space />
                      <q-checkbox v-model="pc[`${part.key}_warranty`]" size="xs" label="보증" dense />
                    </div>
                    <q-input v-model="pc[`${part.key}_name`]" placeholder="모델명" dense outlined bg-color="white" class="q-mb-xs" />
                    <q-input v-model="pc[`${part.key}_sn`]" placeholder="시리얼 번호 (S/N)" dense outlined bg-color="blue-grey-1" style="font-size: 11px" />
                  </div>
                </div>

                <div class="col-12">
                  <div class="bg-indigo-1 q-pa-sm rounded-borders">
                    <div class="text-caption text-weight-bold q-mb-xs text-indigo-9 row items-center">
                      <q-icon name="storage" class="q-mr-xs" /> Storage (SSD/HDD) 확장 정보
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div v-for="i in [0, 1, 2]" :key="i" class="col-12 col-md-4">
                        <div class="bg-white q-pa-xs rounded-borders shadow-1">
                          <div class="row items-center no-wrap">
                            <q-badge color="indigo-7" :label="`Disk${i}`" class="q-mr-xs" />
                            <q-input v-model="pc[`storage${i}_name`]" placeholder="모델명" dense borderless class="col" />
                            <q-checkbox v-model="pc[`storage${i}_warranty`]" size="xs" dense />
                          </div>
                          <q-input v-model="pc[`storage${i}_sn`]" placeholder="시리얼 번호" dense borderless style="font-size: 10px" class="q-px-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const props = defineProps(['modelValue', 'userId', 'customerName']);
const emit = defineEmits(['update:modelValue']);
const $q = useQuasar();

const visible = ref(false);
const pcList = ref([]);
const loading = ref(false);

// 부품 설정 (v-for 활용을 위해 모델 필드와 일치시킴)
const partsConfig = [
  { label: 'CPU (프로세서)', key: 'cpu', icon: 'memory' },
  { label: 'CPU 쿨러', key: 'cooler', icon: 'ac_unit' },
  { label: '메인보드 (M/B)', key: 'mb', icon: 'settings_input_component' },
  { label: '메모리 (RAM)', key: 'ram', icon: 'straighten' },
  { label: '그래픽카드 (VGA)', key: 'vga', icon: 'videogame_asset' },
  { label: '파워 (P/S)', key: 'ps', icon: 'bolt' }, // 기존 pow_를 ps_로 모델명과 통일 권장
  { label: '케이스 (Case)', key: 'case', icon: 'inventory_2' }
];

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val && props.userId) loadUserPcData();
});

watch(visible, (val) => emit('update:modelValue', val));

const loadUserPcData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`http://localhost:3000/api/mypc/user/${props.userId}`);
    if (res.data.success) {
      pcList.value = res.data.data;
    }
  } catch (e) {
    $q.notify({ color: 'negative', message: 'PC 정보를 불러오지 못했습니다.' });
  } finally {
    loading.value = false;
  }
};

const addNewPcEntry = () => {
  // 모델 정의와 완벽하게 일치하는 필드 생성
  const baseParts = ['cpu', 'cooler', 'mb', 'ram', 'vga', 'ps', 'case', 'etc'];
  const newPc = {
    user_id: props.userId,
    pc_nickname: `기기 ${pcList.value.length + 1}`,
  };

  baseParts.forEach(part => {
    newPc[`${part}_name`] = '';
    newPc[`${part}_sn`] = '';
    newPc[`${part}_warranty`] = false;
  });

  for (let i = 0; i < 3; i++) {
    newPc[`storage${i}_name`] = '';
    newPc[`storage${i}_sn`] = '';
    newPc[`storage${i}_warranty`] = false;
  }

  pcList.value.push(newPc);
};

const savePc = async (pc) => {
  try {
    const res = await axios.post(`http://localhost:3000/api/mypc/user/${props.userId}`, pc);
    if (res.data.success) {
      $q.notify({ color: 'positive', message: `[${pc.pc_nickname}] 저장 완료` });
      loadUserPcData(); 
    }
  } catch (e) {
    $q.notify({ color: 'negative', message: '저장 실패: ' + e.message });
  }
};

const confirmDelete = (pc, index) => {
  if (!pc.mypc_id) {
    pcList.value.splice(index, 1);
    return;
  }

  $q.dialog({
    title: '기기 삭제',
    message: `[${pc.pc_nickname}] 정보를 삭제하시겠습니까?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.delete(`http://localhost:3000/api/mypc/${pc.mypc_id}`);
      $q.notify({ color: 'warning', message: '삭제되었습니다.' });
      loadUserPcData();
    } catch (e) {
      $q.notify({ color: 'negative', message: '삭제 실패' });
    }
  });
};
</script>

<style scoped>
.border-light { border: 1px solid #e0e0e0; }
.border-dashed { border: 3px dashed #e0e0e0; }
.scroll { overflow-y: auto; }
</style>