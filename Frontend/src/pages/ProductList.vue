<template>
  <q-page class="bg-grey-1">
    <div class="bg-white q-pa-md shadow-1">
      <div class="container q-mx-auto row items-center justify-between" style="max-width: 1200px;">
        <div class="text-h5 text-weight-bolder">
          <span class="text-blue-7">Ab</span> <span class="text-red-7">SoL</span> 쇼핑몰
        </div>
        
        <div class="col-12 col-md-5 q-mt-sm-none q-mt-md">
          <q-input 
            v-model="search" 
            placeholder="찾으시는 부품이나 컴퓨터를 검색하세요" 
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

    <div class="q-pa-xl container q-mx-auto" style="max-width: 1200px;">
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else-if="products.length === 0" class="text-center q-pa-xl">
        <q-icon name="shopping_cart" size="100px" color="grey-4" />
        <div class="text-h6 text-grey-5 q-mt-md">등록된 상품이 없거나 모두 품절되었습니다.</div>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div 
          v-for="product in products" 
          :key="product.product_id" 
          class="col-12 col-sm-6 col-md-3"
        >
          <q-card class="product-card no-shadow border-light cursor-pointer" @click="goToDetail(product.product_id)">
            <q-img
              :src="product.image_url ? `http://localhost:3000${product.image_url}` : 'https://cdn.quasar.dev/img/no-image.png'"
              :ratio="1"
              class="rounded-borders"
            >
              <div v-if="product.stock === 0" class="absolute-full flex flex-center bg-black-5 text-white text-h6 text-weight-bold">
                품절 (SOLD OUT)
              </div>
              <q-badge v-if="product.is_used" color="orange-9" floating class="q-ma-sm">중고</q-badge>
              <q-badge v-else color="teal-7" floating class="q-pa-xs q-ma-sm">
                    새 상품
               </q-badge>
            </q-img>

            <q-card-section class="q-px-sm q-py-md">
              <div class="text-subtitle1 text-weight-bold ellipsis">{{ product.product_name }}</div>
              <div class="text-caption text-grey-7 ellipsis">{{ product.hardware_info }}</div>
              
              <div class="row items-center justify-between q-mt-md">
                <div class="text-h6 text-primary text-weight-bolder">
                  {{ product.product_price.toLocaleString() }}원
                </div>
                <q-btn flat round color="grey-7" icon="add_shopping_cart" size="sm" />
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
import { useRouter } from 'vue-router';

const router = useRouter();
const products = ref([]);
const search = ref('');
const loading = ref(false);

const loadProducts = async () => {
  loading.value = true;
  try {
    // 사용자용 API 호출 (재고 0인 것은 제외하도록 백엔드에서 처리됨)
    const res = await axios.get('http://localhost:3000/api/products', {
      params: { search: search.value }
    });
    if (res.data.success) {
      products.value = res.data.data;
    }
  } catch (error) {
    console.error('상품 로드 오류:', error);
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id) => {
  // 상세 페이지로 이동 (나중에 구현)
  // router.push(`/product/${id}`);
};

onMounted(loadProducts);
</script>

<style scoped>
.product-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #efefef;
  border-radius: 12px;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
}
.bg-black-5 {
  background: rgba(0, 0, 0, 0.5);
}
.border-light {
  border: 1px solid #f2f2f2;
}
</style>