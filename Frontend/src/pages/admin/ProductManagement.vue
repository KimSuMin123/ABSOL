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

            <q-card-section class="col-3 q-py-md flex flex-center border-left bg-grey-1">
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
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6 text-weight-bold">{{ dialogMode === 'create' ? '신규 상품 등록' : '상품 정보 수정' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit="saveProduct" class="q-gutter-y-md">
            <q-input v-model="form.product_name" label="상품명 *" dense outlined :rules="[val => !!val || '필수 항목']" />
            
            <div class="row q-col-gutter-md">
              <q-input class="col-6" v-model.number="form.product_price" type="number" label="판매 가격 *" dense outlined />
              <q-input class="col-6" v-model.number="form.stock" type="number" label="재고 수량 *" dense outlined />
            </div>

            <div class="q-pa-md bg-blue-grey-1 rounded-borders border-dashed text-center">
              <div class="text-subtitle2 q-mb-sm text-grey-9">상품 사진 등록</div>
              <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="onFileSelected" />
              <q-btn color="white" text-color="primary" icon="cloud_upload" label="사진 선택" @click="$refs.fileInput.click()" />
              
              <div v-if="imageFile" class="q-mt-sm text-caption text-blue-8 text-weight-bold">
                선택됨: {{ imageFile.name }}
              </div>

              <div v-if="imagePreview" class="row justify-center q-mt-md">
                <q-img :src="imagePreview" style="width: 150px; height: 150px; border-radius: 8px" class="shadow-2" />
              </div>
            </div>

            <q-input v-model="form.hardware_info" label="하드웨어 사양" dense outlined />
            <q-input v-model="form.description" type="textarea" label="상품 상세 설명" dense outlined rows="3" />

            <div class="q-pa-sm rounded-borders bg-orange-1">
              <q-checkbox v-model="form.is_used" label="중고 상품 여부" color="orange-10" />
            </div>

            <div class="row justify-end q-mt-lg">
              <q-btn flat label="취소" @click="closeDialog" class="q-mr-sm" />
              <q-btn type="submit" color="primary" icon="save" :label="dialogMode === 'create' ? '등록' : '수정'" />
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

<style scoped>
.product-card { transition: all 0.3s; background: white; }
.border-left { border-left: 1px solid #e0e0e0; }
.border-dashed { border: 2px dashed #cfd8dc; }
.ellipsis-2-lines { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>