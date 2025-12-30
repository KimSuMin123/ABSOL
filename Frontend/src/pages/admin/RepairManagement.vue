<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-lg bg-white q-pa-md shadow-1 rounded-borders">
      <div class="text-h6 text-weight-bold text-blue-9">컴퓨터 수리 마스터 관리</div>
      <q-space />
      <q-btn color="grey-7" icon="refresh" label="새로고침" @click="loadData" flat />
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="repair in repairs" :key="repair.repair_id" class="col-12">
        <q-card flat bordered class="repair-card">
          <q-card-section horizontal>
            <q-card-section class="col-3">
              <div class="row items-center q-mb-sm">
                <q-badge :color="getTypeColor(repair.repair_type)" class="q-mr-sm">{{ repair.repair_type }}</q-badge>
                <div class="text-h6 text-weight-bold">{{ repair.customer_name }}</div>
              </div>
              <div class="text-caption text-grey-8"><q-icon name="phone" /> {{ repair.contact }}</div>
              <div class="text-caption text-grey-7 ellipsis"><q-icon name="location_on" /> {{ repair.address }}</div>
            </q-card-section>

            <q-card-section class="col-3 border-left">
              <div class="text-caption text-weight-bold text-grey-7">고장 증상</div>
              <div class="text-body2 bg-grey-1 q-pa-sm rounded-borders scroll" style="height: 60px">
                {{ repair.symptoms }}
              </div>
            </q-card-section>

            <q-card-section class="col-6 border-left bg-grey-1 row q-col-gutter-sm items-center">
              <div class="col-5">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">수리 방식 변경</div>
                <q-select
                  v-model="repair.repair_type"
                  :options="['수리', '방문수리', '수리불가']"
                  dense outlined bg-color="white"
                  @update:model-value="(val) => updateRepair(repair, 'type', val)"
                />
              </div>

              <div class="col-7">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">진행 단계 업데이트</div>
                <q-select
                  v-model="repair.status"
                  :options="getStatusOptions(repair.repair_type)"
                  dense outlined bg-color="white"
                  @update:model-value="(val) => updateRepair(repair, 'status', val)"
                >
                  <template v-slot:prepend>
                    <q-icon name="trending_flat" color="blue" />
                  </template>
                </q-select>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const repairs = ref([]);
const loading = ref(false);

// 1. 유형별 상태 단계 정의
const statusMap = {
  '수리': ['접수완료', '수리중', '수리완료', '배송중', '수령완료'],
  '방문수리': ['접수완료', '센터입고', '수리중', '수리완료', '배송중', '수령완료'],
  '수리불가': ['접수완료', '수리불가판정', '반송중', '수령완료']
};

const getStatusOptions = (type) => statusMap[type] || ['접수완료'];

const getTypeColor = (type) => {
  if (type === '방문수리') return 'orange-9';
  if (type === '수리불가') return 'red-9';
  return 'blue-9';
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/repairs');
    repairs.value = res.data.data;
  } catch (err) {
    $q.notify({ color: 'negative', message: '로드 실패' });
  } finally {
    loading.value = false;
  }
};

const updateRepair = async (repair, mode, value) => {
  try {
    const payload = {
      repair_type: repair.repair_type,
      status: repair.status
    };
    
    // 만약 유형을 바꿨다면 상태를 '접수완료'로 초기화하는 로직 추가 가능
    if (mode === 'type') payload.status = '접수완료';

    await axios.patch(`http://localhost:3000/api/repairs/${repair.repair_id}/status`, payload);
    
    $q.notify({ color: 'positive', message: '변경사항이 저장되었습니다.', timeout: 1000 });
    if (mode === 'type') loadData(); // 유형 변경 시 목록 새로고침
  } catch (err) {
    $q.notify({ color: 'negative', message: '업데이트 실패' });
  }
};

onMounted(loadData);
</script>