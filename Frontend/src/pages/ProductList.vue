<template>
  <q-page class="bg-grey-1">
    <div class="bg-white q-pa-sm shadow-1">
      <div class="container q-mx-auto row items-center justify-between" style="max-width: 1400px;">
        <div class="text-h6 text-weight-bolder col-shrink q-mr-md cursor-pointer" @click="loadProducts">
          
        </div>
        <div class="col">
          <q-input 
            v-model="search" 
            placeholder="부품명 또는 모델명을 검색하세요..." 
            outlined 
            rounded 
            dense 
            @keyup.enter="loadProducts"
          >
            <template v-slot:append>
              <q-icon name="search" class="cursor-pointer" @click="loadProducts" />
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <div class="q-pa-md container q-mx-auto" style="max-width: 1400px;">
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else-if="products.length === 0" class="text-center q-pa-xl text-grey-6">
        <q-icon name="search_off" size="64px" class="q-mb-sm" />
        <div>검색 결과가 없거나 등록된 상품이 없습니다.</div>
      </div>

      <div v-else class="row q-col-gutter-sm">
        <div 
          v-for="product in products" 
          :key="product.product_id" 
          class="col-6 col-sm-4 col-md-2"
        >
          <q-card 
            class="product-card-compact no-shadow border-light cursor-pointer" 
            @click="goToDetail(product.product_id)"
          >
            <q-img
              :src="product.image_url ? `http://localhost:3000${product.image_url}` : 'https://cdn.quasar.dev/img/no-image.png'"
              :ratio="1"
              class="bg-grey-2"
            >
              <q-badge v-if="product.is_used" color="orange-9" floating class="compact-badge">중고</q-badge>
              <q-badge v-else color="teal-7" floating class="compact-badge">새상품</q-badge>

              <div v-if="product.stock === 0" class="absolute-full flex flex-center bg-black-5 text-caption text-weight-bold">
                품절
              </div>
            </q-img>

            <q-card-section class="q-pa-xs">
              <div class="text-caption text-weight-bold ellipsis-2-lines q-mb-xs" style="height: 34px; line-height: 1.2;">
                {{ product.product_name }}
              </div>
              
              <div class="row items-center justify-between">
                <div class="text-subtitle2 text-primary text-weight-bolder">
                  {{ product.product_price ? product.product_price.toLocaleString() : 0 }}원
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // [추가] 라우터 사용을 위해 import

const router = useRouter(); // [추가] 라우터 인스턴스 생성
const products = ref([]);
const search = ref('');
const loading = ref(false);

/**
 * 상품 상세 페이지 이동 함수
 * @param {Number} id - 상품 고유 번호
 */
const goToDetail = (id) => {
  if (id) {
    router.push(`/product/${id}`); // 동적 라우팅 파라미터 전달
  }
};

/**
 * 상품 데이터 로드 함수
 */
const loadProducts = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/products', {
      params: { search: search.value }
    });
    if (res.data.success) {
      products.value = res.data.data;
    }
  } catch (error) {
    console.error('상품 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadProducts);
</script>

<style scoped>
/* 컴팩트 카드 스타일 */
.product-card-compact {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;
}
.product-card-compact:hover {
  border-color: #2196f3;
  transform: translateY(-2px);
}
.compact-badge {
  font-size: 10px;
  padding: 2px 4px;
  margin: 4px;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bg-black-5 {
  background: rgba(0, 0, 0, 0.4);
}
.border-light {
  border: 1px solid #f2f2f2;
}
</style>