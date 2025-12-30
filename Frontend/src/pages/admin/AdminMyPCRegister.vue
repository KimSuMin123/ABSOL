<template>
  <q-dialog v-model="internalShow" persistent>
    <q-card style="min-width: 800px; border-radius: 16px;">
      
      <q-card-section class="row items-center bg-blue-9 text-white q-pa-md">
        <div class="text-h6 text-weight-bold">
          <q-icon name="computer" class="q-mr-sm" />
          고객 PC 하드웨어 관리
        </div>
        <q-space />
        <div class="text-subtitle1 q-mr-md">{{ customerName }} 고객님</div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg scroll" style="max-height: 70vh">
        <q-form class="q-gutter-y-md">
          
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input 
                v-model="form.pc_nickname" 
                label="PC 식별 별칭" 
                outlined 
                dense 
                placeholder="예: 거실 게임용 본체, 사무용 데스크탑" 
                hint="고객 마이페이지에 표시될 이름입니다."
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 text-blue-9 text-weight-bold q-mb-sm">주요 하드웨어 정보</div>
          <div v-for="item in hardwareParts" :key="item.key" class="row q-col-gutter-sm items-center q-mb-sm bg-grey-1 q-pa-sm rounded-borders">
            <div class="col-12 col-sm-2 text-weight-medium text-center">{{ item.label }}</div>
            <div class="col-12 col-sm-5">
              <q-input v-model="form[`${item.key}_name`]" label="모델명" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="form[`${item.key}_sn`]" label="시리얼 번호(S/N)" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-sm-2 text-center">
              <q-checkbox v-model="form[`${item.key}_warranty`]" label="보증유효" color="blue-7" />
            </div>
          </div>

          <q-expansion-item
            label="저장장치 상세 등록 (SSD / HDD)"
            icon="storage"
            header-class="text-weight-bold text-grey-8 bg-grey-2"
            class="rounded-borders overflow-hidden q-mt-md"
          >
            <q-card>
              <q-card-section v-for="n in [0, 1, 2]" :key="n" class="row q-col-gutter-sm items-center q-py-xs">
                <div class="col-2 text-center text-caption">Disk {{ n }}</div>
                <div class="col-5"><q-input v-model="form[`storage${n}_name`]" label="모델명" outlined dense /></div>
                <div class="col-3"><q-input v-model="form[`storage${n}_sn`]" label="S/N" outlined dense /></div>
                <div class="col-2 text-center"><q-checkbox v-model="form[`storage${n}_warranty`]" /></div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn flat label="닫기" color="grey-7" v-close-popup />
        <q-btn 
          label="고객 PC 정보 저장" 
          color="blue-9" 
          icon="save" 
          unelevated 
          :loading="saving"
          @click="saveMyPC" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

// 부모로부터 받을 데이터: 모달 표시 여부, 대상 유저 ID, 고객 이름
const props = defineProps({
  modelValue: Boolean,
  userId: [Number, String],
  customerName: String
});

const emit = defineEmits(['update:modelValue']);
const $q = useQuasar();

const saving = ref(false);
const form = ref({});

// 하드웨어 파트 정의
const hardwareParts = [
  { label: 'CPU', key: 'cpu' },
  { label: '메인보드', key: 'mb' },
  { label: '메모리', key: 'ram' },
  { label: '그래픽카드', key: 'vga' },
  { label: '파워', key: 'ps' },
  { label: '케이스', key: 'case' },
  { label: '기타/쿨러', key: 'etc' }
];

// 부모의 v-model과 동기화
const internalShow = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 모달이 열릴 때 데이터 로드
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen && props.userId) {
    try {
      const res = await axios.get(`http://localhost:3000/api/admin/mypc/${props.userId}`);
      if (res.data.success && res.data.data) {
        form.value = res.data.data;
      } else {
        // 데이터가 없으면 초기값 세팅
        form.value = { pc_nickname: '내 컴퓨터', cpu_warranty: true, mb_warranty: true, vga_warranty: true };
      }
    } catch (error) {
      console.error('PC 정보 로드 실패');
    }
  }
});

// 데이터 저장 (POST)
const saveMyPC = async () => {
  if (!props.userId) return;
  
  saving.value = true;
  try {
    const res = await axios.post(`http://localhost:3000/api/mypc/${props.userId}`, form.value);
    if (res.data.success) {
      $q.notify({ color: 'positive', message: '고객 PC 하드웨어 정보가 저장되었습니다.', icon: 'done' });
      internalShow.value = false;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '정보 저장 중 오류가 발생했습니다.' });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.rounded-borders { border-radius: 8px; }
</style>