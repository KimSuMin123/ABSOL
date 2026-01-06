<template>
  <q-card flat bordered class="bg-white q-pa-md shadow-1 rounded-borders">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h6 text-weight-bolder text-blue-10">
        <q-icon name="monitor" color="primary" size="sm" class="q-mr-sm" />
        내 컴퓨터  관리
      </div>
      <q-btn flat round color="grey-7" icon="refresh" @click="loadMyPcs">
        <q-tooltip>새로고침</q-tooltip>
      </q-btn>
    </div>

    <div v-if="pcList.length > 0" class="column q-gutter-y-md">
      <q-expansion-item
        v-for="(pc, index) in pcList"
        :key="pc.mypc_id"
        group="mypcs"
        header-class="bg-blue-1 text-primary text-weight-bold rounded-borders"
        expand-icon-class="text-primary"
        class="border-light rounded-borders overflow-hidden"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-icon name="monitor" color="primary" size="sm" class="q-mr-sm" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-subtitle1">{{ pc.pc_nickname || `기기 #${index + 1}` }}</q-item-label>
            
          </q-item-section>
        </template>

        <q-card>
          <q-card-section class="q-pa-md bg-grey-0">
            <div class="row q-col-gutter-sm">
              <div v-for="part in getSpecFields(pc)" :key="part.label" class="col-12 col-sm-6 col-md-4">
                <div class="spec-item q-pa-sm rounded-borders bg-white border-light shadow-transition">
                  <div class="row items-center no-wrap">
                    <q-icon :name="part.icon" color="grey-6" class="q-mr-sm" size="xs" />
                    <div class="column">
                      <span class="text-caption text-grey-7">{{ part.label }}</span>
                      <span class="text-weight-bold text-dark">{{ part.value || '정보 없음' }}</span>
                    </div>
                    <q-space />
                    <q-badge v-if="part.warranty" color="green-1" text-color="green-9" label="보증" />
                  </div>
                </div>
              </div>
            </div>

            <div class="q-mt-md text-center text-caption text-grey-6">
              <q-icon name="info" class="q-mr-xs" /> 사양 변경이 필요하거나 오기재된 경우 고객센터로 문의해주세요.
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>

    <div v-else class="text-center q-py-xl border-dashed rounded-borders bg-grey-1">
      <q-icon name="monitor_heart" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">등록된 PC 정보가 없습니다.</div>
      <div class="text-caption text-grey-5 q-mb-md">매장에서 구입 또는 수리 시 기기가 자동 등록됩니다.</div>
      <q-btn flat color="primary" label="1:1 문의하기" icon="chat" />
    </div>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import axios from 'axios';

const userStore = useUserStore();
const pcList = ref([]);

// 부품 아이콘 및 레이블 설정
const getSpecFields = (pc) => [
  { label: 'CPU', value: pc.cpu_name, sn: pc.cpu_sn, icon: 'memory', warranty: pc.cpu_warranty },
  { label: 'CPU 쿨러', value: pc.cooler_name, sn: pc.cooler_sn, icon: 'ac_unit', warranty: pc.cooler_warranty }, // 추가
  { label: '메인보드', value: pc.mb_name, sn: pc.mb_sn, icon: 'settings_input_component', warranty: pc.mb_warranty },
  { label: '그래픽카드', value: pc.vga_name, sn: pc.vga_sn, icon: 'videogame_asset', warranty: pc.vga_warranty },
  { label: '메모리', value: pc.ram_name, sn: pc.ram_sn, icon: 'straighten', warranty: pc.ram_warranty },
  { label: '파워', value: pc.ps_name, sn: pc.ps_sn, icon: 'bolt', warranty: pc.ps_warranty },
  { label: '케이스', value: pc.case_name, sn: pc.case_sn, icon: 'inventory_2', warranty: pc.case_warranty }, // 추가
  { label: '운영체제', value: pc.os_info, icon: 'window', warranty: false }, // 추가
  { label: 'SSD/HDD 0', value: pc.storage0_name, sn: pc.storage0_sn, icon: 'storage', warranty: pc.storage0_warranty },
 { label: 'SSD/HDD 1', value: pc.storage1_name, sn: pc.storage1_sn, icon: 'storage', warranty: pc.storage0_warranty },
  { label: 'SSD/HDD 2', value: pc.storage2_name, sn: pc.storage2_sn, icon: 'storage', warranty: pc.storage0_warranty }
];

const loadMyPcs = async () => {
  if (!userStore.user?.id) return;
  try {
    const res = await axios.get(`http://svc.sel3.cloudtype.app:30209/api/mypc/user/${userStore.user.id}`);
    if (res.data.success) {
      pcList.value = res.data.data;
    }
  } catch (e) {
    console.error('기기 정보 로드 실패');
  }
};

onMounted(loadMyPcs);
</script>

<style scoped>
.rounded-borders { border-radius: 12px; }
.border-light { border: 1px solid #eef2f6; }
.border-dashed { border: 2px dashed #e0e0e0; }
.spec-item { border: 1px solid #f0f4f8; }
.spec-item:hover { border-color: #2196F3; background-color: #f0f7ff !important; }
</style>