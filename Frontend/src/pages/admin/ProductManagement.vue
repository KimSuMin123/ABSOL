<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold">
          <span class="text-blue-7">AB</span><span class="text-red-7">SOL</span> 
          <span class="q-ml-sm text-subtitle1 text-grey-8">전체 상품 관리</span>
        </div>
        <q-space />
        <q-btn color="primary" icon="add" label="새 상품 등록" @click="openDialog('create')" />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-4">
          <q-input 
            v-model="searchQuery" 
            placeholder="상품명 또는 사양 검색" 
            dense outlined 
            clearable
          >
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-4">
          <q-select 
            v-model="typeFilter" 
            :options="['전체', '새상품', '중고 상품']" 
            label="상품 유형 필터" 
            dense outlined 
          />
        </div>
        <div class="col-12 col-sm-4">
          <q-select 
            v-model="stockFilter" 
            :options="['전체', '재고 있음', '품절 상품']" 
            label="재고 상태 필터" 
            dense outlined 
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="filteredProducts.length === 0 && !loading" class="col-12 text-center q-pa-xl text-grey-6 bg-white rounded-borders shadow-1">
        조건에 맞는 상품이 없습니다.
      </div>

      <div v-for="product in filteredProducts" :key="product.product_id" class="col-12">
        <q-card flat bordered class="product-card shadow-1">
          <q-card-section horizontal>
            <q-img
              class="col-2 rounded-borders q-ma-sm"
              :src="product.image_url ? `http://localhost:3000${product.image_url}` : 'https://cdn.quasar.dev/img/no-image.png'"
              style="max-width: 120px; height: 120px; object-fit: cover;"
            />

            <q-card-section class="col-4 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge :color="product.is_used ? 'orange-9' : 'teal-8'" class="q-mr-sm">
                  {{ product.is_used ? '중고' : '새상품' }}
                </q-badge>
                <div class="text-h6 text-weight-bold">{{ product.product_name }}</div>
              </div>
              <div class="text-subtitle1 text-primary text-weight-bolder">
                {{ product.product_price ? product.product_price.toLocaleString() : 0 }}원
              </div>
              <div class="text-caption text-grey-7 q-mt-sm ellipsis-2-lines">
                {{ product.description || '설명 없음' }}
              </div>
            </q-card-section>

            <q-card-section class="col-3 q-py-md border-left">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">상세 사양</div>
              <div class="text-body2 bg-grey-1 q-pa-sm rounded-borders scroll" style="height: 70px">
                {{ product.hardware_info || '미등록' }}
              </div>
            </q-card-section>

            <q-card-section class="col-3 q-py-md flex flex-center border-left ">
              <div class="text-center full-width q-mb-md">
                <div class="text-caption text-grey-7 q-mb-xs">재고 상태</div>
                <div class="row items-center justify-center q-gutter-x-sm">
                  <q-badge :color="product.stock > 0 ? 'blue-6' : 'red-6'" :label="product.stock > 0 ? '보유' : '품절'" />
                  <div class="text-weight-bold" :class="product.stock === 0 ? 'text-red' : ''" style="font-size: 1.5rem">
                    {{ product.stock }} 개
                  </div>
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
      </q-dialog>

    <q-inner-loading :showing="loading"><q-spinner-grid size="50px" color="primary" /></q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // computed 추가
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const products = ref([]);
const loading = ref(false);

// 필터링 상태값
const searchQuery = ref('');
const typeFilter = ref('전체');
const stockFilter = ref('전체');

// [핵심] 프론트엔드 실시간 복합 필터 로직
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    // 1. 검색어 체크 (상품명 또는 하드웨어 정보)
    const name = product.product_name || '';
    const info = product.hardware_info || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         info.toLowerCase().includes(searchQuery.value.toLowerCase());

    // 2. 상품 유형 체크 (새상품/중고)
    let matchesType = true;
    if (typeFilter.value === '새상품') matchesType = !product.is_used;
    else if (typeFilter.value === '중고 상품') matchesType = product.is_used;

    // 3. 재고 상태 체크
    let matchesStock = true;
    if (stockFilter.value === '재고 있음') matchesStock = product.stock > 0;
    else if (stockFilter.value === '품절 상품') matchesStock = product.stock === 0;

    return matchesSearch && matchesType && matchesStock;
  });
});

// ... 기존 script 로직 (loadProducts, openDialog, saveProduct 등) 동일하게 유지 ...
// (단, loadProducts 내 axios 주소 및 logic 유지)

const dialogVisible = ref(false);
const dialogMode = ref('create');
const fileInput = ref(null);
const imageFile = ref(null);
const imagePreview = ref(null);

const initialForm = {
  product_id: null,
  product_name: '',
  product_price: 0,
  stock: 0,
  is_used: false,
  description: '',
  hardware_info: '',
  image_url: ''
};
const form = ref({ ...initialForm });

const loadProducts = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/products/admin/all');
    if (res.data.success) products.value = res.data.data;
  } catch (err) {
    $q.notify({ color: 'negative', message: '데이터 로드 실패' });
  } finally {
    loading.value = false;
  }
};

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const openDialog = (mode, row = null) => {
  dialogMode.value = mode;
  if (mode === 'edit' && row) {
    form.value = { ...row };
    imagePreview.value = row.image_url ? `http://localhost:3000${row.image_url}` : null;
  } else {
    form.value = { ...initialForm };
    imagePreview.value = null;
  }
  imageFile.value = null;
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  imageFile.value = null;
  imagePreview.value = null;
};

const saveProduct = async () => {
  try {
    const formData = new FormData();
    formData.append('product_name', form.value.product_name);
    formData.append('product_price', form.value.product_price);
    formData.append('stock', form.value.stock);
    formData.append('hardware_info', form.value.hardware_info || '');
    formData.append('description', form.value.description || '');
    formData.append('is_used', form.value.is_used);

    if (imageFile.value) {
      formData.append('image', imageFile.value);
    }

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };

    if (dialogMode.value === 'create') {
      await axios.post('http://localhost:3000/api/products', formData, config);
    } else {
      await axios.put(`http://localhost:3000/api/products/${form.value.product_id}`, formData, config);
    }
    
    closeDialog();
    loadProducts();
    $q.notify({ color: 'positive', message: '저장 완료' });
  } catch (err) {
    $q.notify({ color: 'negative', message: '저장 중 오류 발생' });
  }
};

const confirmDelete = (product) => {
  $q.dialog({ title: '삭제 확인', message: `[${product.product_name}]을 삭제하시겠습니까?`, cancel: true, persistent: true })
    .onOk(async () => {
      try {
        await axios.delete(`http://localhost:3000/api/products/${product.product_id}`);
        loadProducts();
      } catch (err) { $q.notify({ color: 'negative', message: '삭제 실패' }); }
    });
};

onMounted(loadProducts);
</script>