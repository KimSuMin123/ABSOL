<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">
          <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
          <span class="q-ml-sm text-subtitle1 text-grey-8">회원 마스터 관리</span>
        </div>
        <q-space />
        <q-btn color="primary" icon="person_add" label="회원 추가" @click="$router.push({ path: '/register', query: { pw: '0000' } })" class="q-mr-sm" />
        <q-btn color="grey-7" icon="refresh" label="새로고침" @click="loadData" flat />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-4">
          <q-input v-model="searchQuery" label="회원명 검색" dense outlined @keyup.enter="loadData">
            <template v-slot:append><q-icon name="search" class="cursor-pointer" @click="loadData" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-3">
          <q-select v-model="selectedLevel" :options="['전체', 'Basic', 'Standard', 'Green', 'Silver', 'Gold']" label="회원 등급 필터" dense outlined @update:model-value="loadData" />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="users.length === 0 && !loading" class="col-12 text-center q-pa-xl text-grey-6 bg-white shadow-1 rounded-borders">
        조회된 회원 내역이 없습니다.
      </div>

      <div v-for="user in users" :key="user.user_id" class="col-12">
        <q-card flat bordered class="user-card shadow-1">
          <q-card-section horizontal>
            <div class="col-2 flex flex-center q-ma-sm rounded-borders" :class="getLevelBgColor(user.level)" style="max-width: 120px; height: 120px">
              <q-icon :name="user.level === 'Gold' ? 'stars' : 'account_circle'" size="64px" :color="getLevelColor(user.level)" />
            </div>

            <q-card-section class="col-3 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge :color="getLevelColor(user.level)" class="q-mr-sm">{{ user.level }}</q-badge>
                <div class="text-h6 text-weight-bold">{{ user.customer_name }}</div>
              </div>
              <div class="text-subtitle2 text-primary">ID: {{ user.login_id }}</div>
              <div class="text-caption text-grey-7 q-mt-xs"><q-icon name="phone" size="xs" /> {{ user.phone || '연락처 없음' }}</div>
            </q-card-section>

            <q-card-section class="col-4 q-py-md border-left">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">고객 관리 정보</div>
              <div class="text-h6 text-weight-bolder text-blue-9">
                {{ user.customer_code || '발급 전' }}
              </div>
              <div class="text-caption text-grey-7 q-mt-sm ellipsis-2-lines">
                <q-icon name="location_on" size="xs" /> {{ user.address || '주소 미등록' }}
              </div>
            </q-card-section>

            <q-card-section class="col-3 q-py-md flex flex-center border-left bg-grey-1">
              <div class="text-center full-width q-gutter-y-xs">
                <q-btn flat color="blue-9" label="PC 하드웨어 관리" icon="computer" dense class="full-width text-weight-bold" @click="openMyPCModal(user)" />
                <q-separator />
                <q-btn flat color="grey-8" label="정보 수정 및 코드갱신" icon="edit" dense class="full-width" @click="openEditDialog(user)" /><q-separator />
                <q-btn flat color="grey-8" label="고객 기기 조회" icon="devices" dense class="full-width" @click="openUserPCList(user)" />
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="editDialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">회원 정보 및 고객코드 수정</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md q-gutter-y-sm">
          <div class="row q-col-gutter-sm">
            <q-input v-model="editForm.customer_name" label="성함" outlined dense class="col-6" />
            <q-input v-model="editForm.phone" label="연락처" outlined dense class="col-6" mask="###-####-####" />
          </div>
          <q-input v-model="editForm.address" label="주소" outlined dense />

          <q-separator q-my-md />
          
          <div class="text-subtitle2 text-blue-9 q-mb-xs">고객 코드 조합 설정 (25년 {{ currentQuarter }}분기 기준)</div>
          <div class="row q-col-gutter-sm">
            <q-select v-model="editForm.region" :options="regionOptions" label="지역" outlined dense emit-value map-options class="col-4" />
            <q-select v-model="editForm.type" :options="typeOptions" label="고객 유형" outlined dense emit-value map-options class="col-4" />
            <q-select v-model="editForm.productLine" :options="lineOptions" label="라인업" outlined dense emit-value map-options class="col-4" />
          </div>

          <div class="bg-blue-1 q-pa-sm rounded-borders q-mt-md text-center border-blue">
            <div class="text-caption text-grey-7 text-weight-bold">새로 발급될 코드</div>
            <div class="text-h5 text-weight-bolder text-blue-10">
              {{ previewCustomerCode }}
            </div>
          </div>

          <q-select v-model="editForm.level" :options="['Basic', 'Standard', 'Green', 'Silver', 'Gold']" label="회원 등급" outlined dense class="q-mt-md" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="취소" v-close-popup />
          <q-btn color="primary" label="정보 및 코드 저장" @click="updateUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AdminMyPCModal v-model="pcModal.show" :user-id="pcModal.userId" :customer-name="pcModal.userName" />
<AdminUserPCList 
  v-model="userPCListModal.show" 
  :user-id="userPCListModal.userId" 
  :customer-name="userPCListModal.userName" 
  @refresh="loadData"
/>
    <q-inner-loading :showing="loading"><q-spinner-grid size="50px" color="primary" /></q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import AdminMyPCModal from './AdminMyPCRegister.vue';
import AdminUserPCList from './AdminUserPCList.vue';

const $q = useQuasar();
const $router = useRouter();

const users = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedLevel = ref('전체');

// 1. 고객 코드 규칙 옵션 데이터
const regionOptions = [
  { label: '서울', value: '1' }, { label: '경기', value: '2' }, { label: '인천', value: '3' },
  { label: '강원', value: '4' }, { label: '충남', value: '5' }, { label: '충북', value: '6' },
  { label: '경북', value: '7' }, { label: '경남', value: '8' }, { label: '전라도', value: '9' }
];

const typeOptions = [
  { label: '수리', value: '1' }, { label: '본체구입', value: '2' }, { label: '부품', value: '3' },
  { label: '데이터복구', value: '4' }, { label: '청소/점검', value: '5' }, { label: 'OS/설치', value: '6' }, { label: '조립', value: '7' }
];

const lineOptions = [
  { label: '일반/예외', value: '1' }, { label: 'Aim-9B(사무)', value: '2' },
  { label: 'Sparrow-7D(보급)', value: '3' }, { label: 'Aim-120A(최고)', value: '4' }
];

// 현재 분기 계산
const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

// 2. 다이얼로그 및 폼 상태
const editDialogVisible = ref(false);
const editForm = ref({
  user_id: null,
  customer_name: '',
  phone: '',
  address: '',
  level: '',
  region: '1',
  type: '1',
  productLine: '1'
});
const userPCListModal = ref({ show: false, userId: null, userName: '' });
const openUserPCList = (user) => {
  userPCListModal.value.userId = user.user_id;
  userPCListModal.value.userName = user.customer_name;
  userPCListModal.value.show = true;
};

const pcModal = ref({ show: false, userId: null, userName: '' });

// 3. 실시간 코드 미리보기 계산 (YY + Q + R + T + ID + L)
const previewCustomerCode = computed(() => {
  const yy = '25'; // 발급년도 고정
  const q = String(currentQuarter);
  const r = editForm.value.region || '1';
  const t = editForm.value.type || '1';
  const id = String(editForm.value.user_id || 0).padStart(3, '0'); // 고유ID 3자리
  const l = editForm.value.productLine || '1';
  
  return `${yy}${q}${r}${t}${id}${l}`;
});

// 데이터 로드
const loadData = async () => {
  loading.value = true;
  try {
    const params = {};
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedLevel.value !== '전체') params.level = selectedLevel.value;

    const res = await axios.get('http://localhost:3000/api/users', { params });
    if (res.data?.success) {
      users.value = res.data.data;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '데이터 로딩 오류' });
  } finally {
    loading.value = false;
  }
};

const openEditDialog = (user) => {
  editForm.value = { 
    ...user,
    // 기존 코드가 있다면 파싱하여 세팅 (없으면 기본값 '1')
    region: user.customer_code ? user.customer_code[3] : '1',
    type: user.customer_code ? user.customer_code[4] : '1',
    productLine: user.customer_code ? user.customer_code.slice(-1) : '1'
  };
  editDialogVisible.value = true;
};

const updateUser = async () => {
  try {
    // 미리보기 코드를 포함하여 전송
    const payload = {
      ...editForm.value,
      customer_code: previewCustomerCode.value
    };
    
    const res = await axios.patch(`http://localhost:3000/api/users/${editForm.value.user_id}`, payload);
    if (res.data.success) {
      $q.notify({ color: 'positive', message: '정보 및 고객코드가 갱신되었습니다.' });
      editDialogVisible.value = false;
      loadData();
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '수정 실패' });
  }
};

const openMyPCModal = (user) => {
  pcModal.value.userId = user.user_id;
  pcModal.value.userName = user.customer_name;
  pcModal.value.show = true;
};

// 스타일 도우미
const getLevelColor = (level) => {
  const colors = { Gold: 'amber-9', Silver: 'blue-grey-7', Green: 'green-7', Standard: 'blue-6', Basic: 'grey-7' };
  return colors[level] || 'grey-7';
};

const getLevelBgColor = (level) => {
  const bgColors = { Gold: 'amber-1', Silver: 'blue-grey-1', Green: 'green-1', Standard: 'blue-1', Basic: 'grey-2' };
  return bgColors[level] || 'grey-2';
};

onMounted(loadData);
</script>

<style scoped>
.user-card { transition: all 0.3s ease; border-radius: 12px; }
.user-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
.border-left { border-left: 1px solid #e0e0e0; }
.border-blue { border: 2px dashed #2196F3; }
</style>