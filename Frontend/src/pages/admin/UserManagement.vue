<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">
          <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
          <span class="q-ml-sm text-subtitle1 text-grey-8">회원 마스터 관리</span>
        </div>
        <q-space />
        <q-btn 
  color="primary" 
  icon="person_add" 
  label="회원 추가" 
  @click="$router.push({ path: '/register', query: { pw: '0000' } })" 
  class="q-mr-sm" 
/>
        <q-btn color="grey-7" icon="refresh" label="새로고침" @click="loadData" flat />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-4">
          <q-input v-model="searchQuery" label="회원명 검색" dense outlined @keyup.enter="loadData">
            <template v-slot:append>
              <q-icon name="search" class="cursor-pointer" @click="loadData" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-3">
          <q-select 
            v-model="selectedLevel" 
            :options="['전체', 'Basic', 'Silver', 'Gold', 'VIP']" 
            label="회원 등급 필터" 
            dense outlined 
            @update:model-value="loadData"
          />
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
            <div class="col-2 flex flex-center q-ma-sm rounded-borders" 
                 :class="getLevelBgColor(user.level)" 
                 style="max-width: 120px; height: 120px">
              <q-icon :name="user.level === 'VIP' ? 'stars' : 'account_circle'" size="64px" :color="getLevelColor(user.level)" />
            </div>

            <q-card-section class="col-4 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge :color="getLevelColor(user.level)" class="q-mr-sm">{{ user.level }}</q-badge>
                <div class="text-h6 text-weight-bold">{{ user.customer_name }}</div>
              </div>
              <div class="text-subtitle2 text-primary">ID: {{ user.login_id }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">
                <q-icon name="phone" size="xs" /> {{ user.phone || '연락처 없음' }}
              </div>
            </q-card-section>

            <q-card-section class="col-4 q-py-md border-left">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">고객 관리 정보</div>
              <div class="text-body2 text-weight-bold text-blue-9">코드: {{ user.customer_code || '발급 전' }}</div>
              <div class="text-caption text-grey-7 q-mt-sm ellipsis-2-lines">
                <q-icon name="location_on" size="xs" /> {{ user.address || '주소 미등록' }}
              </div>
            </q-card-section>

            <q-card-section class="col-2 q-py-md flex flex-center border-left bg-grey-1">
              <div class="text-center full-width">
                <div class="text-caption text-grey-7">가입일</div>
                <div class="text-weight-bold text-blue-grey-9">
                  {{ user.createdAt ? user.createdAt.substring(0, 10) : '-' }}
                </div>
                <q-btn flat color="primary" label="정보수정" icon="edit" dense class="q-mt-sm" @click="openEditDialog(user)" />
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="editDialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">회원 정보 수정</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-form @submit="updateUser" class="q-gutter-md">
            <q-input v-model="editForm.customer_name" label="성함" outlined dense />
            <q-input v-model="editForm.phone" label="연락처" outlined dense />
            <q-input v-model="editForm.address" label="주소" outlined dense />
            
            <q-select 
              v-model="editForm.level" 
              :options="['Basic', 'Silver', 'Gold', 'VIP']" 
              label="회원 등급" 
              outlined dense 
            />

            <div class="row justify-end q-mt-md">
             
             <q-btn flat label="취소" @click="closeDialog" class="q-mr-sm" />
              <q-btn type="submit" color="primary" label="저장하기" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="loading">
      <q-spinner-grid size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'; // 라우터 사용

const $q = useQuasar();
const $router = useRouter(); // 라우터 인스턴스

const users = ref([]);
const loading = ref(false);

// 필터 및 검색 변수
const searchQuery = ref('');
const selectedLevel = ref('전체');

// 수정 다이얼로그 관련 변수
const editDialogVisible = ref(false);
const editForm = ref({
  user_id: null,
  customer_name: '',
  phone: '',
  address: '',
  level: ''
});

const loadData = async () => {
  loading.value = true;
  try {
    const params = {};
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedLevel.value !== '전체') params.level = selectedLevel.value;

    const res = await axios.get('http://localhost:3000/api/users', { params });
    if (res.data && res.data.success) {
      users.value = res.data.data;
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '회원 데이터를 불러오는 중 오류가 발생했습니다.' });
  } finally {
    loading.value = false;
  }
};

// 수정 다이얼로그 열기
const openEditDialog = (user) => {
  editForm.value = { ...user }; // 선택한 회원 정보를 폼에 복사
  editDialogVisible.value = true;
};

// 정보 업데이트 실행
const updateUser = async () => {
  try {
    const res = await axios.patch(`http://localhost:3000/api/users/${editForm.value.user_id}/level`, {
      customer_name: editForm.value.customer_name,
      phone: editForm.value.phone,
      address: editForm.value.address,
      level: editForm.value.level
    });
    
    if (res.data.success) {
      $q.notify({ color: 'positive', message: '회원 정보가 수정되었습니다.' });
      editDialogVisible.value = false;
      loadData(); // 목록 새로고침
    }
  } catch (error) {
    $q.notify({ color: 'negative', message: '수정 중 오류가 발생했습니다.' });
  }
};

const getLevelColor = (level) => {
  const colors = { VIP: 'purple-7', Gold: 'amber-9', Silver: 'blue-grey-4', Basic: 'grey-7' };
  return colors[level] || 'grey-7';
};

const getLevelBgColor = (level) => {
  const bgColors = { VIP: 'purple-1', Gold: 'amber-1', Silver: 'blue-grey-1', Basic: 'grey-2' };
  return bgColors[level] || 'grey-2';
};

onMounted(loadData);
</script>