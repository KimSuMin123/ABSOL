<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-lg bg-white q-pa-md shadow-1 rounded-borders">
      <div class="text-h6 text-weight-bold">
        <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
        <span class="q-ml-sm text-subtitle1 text-grey-8">전체 상품 마스터 관리</span>
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="새 상품 등록" @click="openDialog('create')" />
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="product in products" :key="product.product_id" class="col-12">
        <q-card flat bordered class="product-card">
          <q-card-section horizontal>
            <q-img
              class="col-2 rounded-borders q-ma-sm"
              :src="product.image_url || 'https://cdn.quasar.dev/img/no-image.png'"
              style="max-width: 120px; height: 120px"
            />

            <q-card-section class="col-4 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge :color="product.is_used ? 'orange-9' : 'teal-8'" class="q-mr-sm">
                  {{ product.is_used ? '중고' : '새상품' }}
                </q-badge>
                <div class="text-h6 text-weight-bold">{{ product.product_name }}</div>
              </div>
              <div class="text-subtitle1 text-primary text-weight-bolder">
                {{ product.product_price.toLocaleString() }}원
              </div>
              <div class="text-caption text-grey-7 q-mt-sm ellipsis-2-lines">
                {{ product.description || '설명 없음' }}
              </div>
            </q-card-section>

            <q-card-section class="col-3 q-py-md border-left">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">상세 사양</div>
              <div class="text-body2 bg-grey-1 q-pa-xs rounded-borders" style="min-height: 60px">
                {{ product.hardware_info || '미등록' }}
              </div>
            </q-card-section>

            <q-card-section class="col-3 q-py-md flex flex-center border-left bg-grey-1">
              <div class="text-center full-width q-mb-md">
                <div class="text-caption text-grey-7">현재 재고</div>
                <div :class="product.stock < 5 ? 'text-red text-weight-bolder' : 'text-weight-bold'" style="font-size: 1.5rem">
                  {{ product.stock }} <span class="text-caption">개</span>
                </div>
              </div>
              <div class="row q-gutter-x-sm">
                <q-btn color="warning" icon="edit" label="수정" dense class="q-px-md" @click="openDialog('edit', product)" />
                <q-btn color="negative" icon="delete" label="삭제" dense class="q-px-md" @click="confirmDelete(product)" />
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ dialogMode === 'create' ? '신규 상품 등록' : '상품 정보 수정' }}</div>
          <q-space />
         <q-btn icon="close" flat round dense @click="dialogVisible = false" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit="saveProduct" class="q-gutter-y-md">
            <q-input v-model="form.product_name" label="상품명 *" dense outlined :rules="[val => !!val || '필수 항목']" />
            
            <div class="row q-col-gutter-md">
              <q-input class="col-6" v-model.number="form.product_price" type="number" label="판매 가격 *" dense outlined />
              <q-input class="col-6" v-model.number="form.stock" type="number" label="초기 재고 *" dense outlined />
            </div>

            <q-input v-model="form.hardware_info" label="하드웨어 사양 (CPU/RAM/VGA 등)" dense outlined hint="부품 정보를 상세히 입력하세요" />
            
            <q-input v-model="form.image_url" label="이미지 경로 (URL)" dense outlined />
            
            <q-input v-model="form.description" type="textarea" label="상품 상세 설명" dense outlined rows="3" />

            <div class="q-pa-sm rounded-borders bg-orange-1">
              <q-checkbox v-model="form.is_used" label="중고 상품 여부" color="orange-10" keep-color />
              <span class="text-caption text-grey-8 q-ml-sm">(체크 시 목록에 '중고' 배지가 표시됩니다)</span>
            </div>

            <div class="row justify-end q-mt-lg">
            <q-btn flat label="취소" @click="dialogVisible = false" class="q-mr-sm" />
              <q-btn type="submit" color="primary" icon="save" :label="dialogMode === 'create' ? '상품 등록' : '정보 업데이트'" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const products = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref('create');

// Sequelize 모델과 1:1 매칭되는 초기 데이터
const initialForm = {
  product_id: null,
  image_url: '',
  product_name: '',
  product_price: 0,
  stock: 0,
  is_used: false,
  description: '',
  hardware_info: ''
};

const form = ref({ ...initialForm });

const loadProducts = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/products/admin/all');
    if (res.data.success) products.value = res.data.data;
  } catch (err) {
    $q.notify({ color: 'negative', message: '서버 데이터를 가져오지 못했습니다.' });
  } finally {
    loading.value = false;
  }
};

const openDialog = (mode, row = null) => {
  dialogMode.value = mode;
  form.value = mode === 'edit' && row ? { ...row } : { ...initialForm };
  dialogVisible.value = true;
};

const saveProduct = async () => {
  try {
    if (dialogMode.value === 'create') {
      await axios.post('http://localhost:3000/api/products', form.value);
      $q.notify({ color: 'positive', message: '데이터베이스에 저장되었습니다.' });
    } else {
      await axios.put(`http://localhost:3000/api/products/${form.value.product_id}`, form.value);
      $q.notify({ color: 'positive', message: '정보가 수정되었습니다.' });
    }
    dialogVisible.value = false;
    loadProducts();
  } catch (err) {
    $q.notify({ color: 'negative', message: '저장 처리 중 오류 발생' });
  }
};

const confirmDelete = (product) => {
  $q.dialog({
    title: '🧨 상품 영구 삭제',
    message: `[${product.product_name}] 상품을 DB에서 삭제하시겠습니까?`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: '삭제 실행' }
  }).onOk(async () => {
    try {
      await axios.delete(`http://localhost:3000/api/products/${product.product_id}`);
      loadProducts();
      $q.notify({ color: 'blue-grey-9', message: '삭제 완료' });
    } catch (err) {
      $q.notify({ color: 'negative', message: '삭제 실패' });
    }
  });
};

onMounted(loadProducts);
</script>

<style scoped>
.product-card {
  transition: all 0.3s;
  background: white;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
}
.border-left {
  border-left: 1px solid #e0e0e0;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>