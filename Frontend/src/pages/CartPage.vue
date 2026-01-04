<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 800px;">
      <div class="text-h5 text-weight-bolder q-mb-lg">내 장바구니 ({{ cartStore.totalCount }})</div>

      <div v-if="cartStore.items.length === 0" class="text-center q-pa-xl bg-white rounded-borders shadow-1">
        <q-icon name="shopping_cart" size="100px" color="grey-4" />
        <div class="text-h6 text-grey-5 q-mt-md">장바구니가 비어 있습니다.</div>
        <q-btn label="쇼핑하러 가기" color="primary" class="q-mt-md" to="/order" />
      </div>

      <div v-else>
        <q-card v-for="item in cartStore.items" :key="item.product_id" flat bordered class="q-mb-sm bg-white">
          <q-card-section horizontal class="items-center">
            <q-img :src="item.image_url ? `http://localhost:3000${item.image_url}` : 'https://cdn.quasar.dev/img/no-image.png'" style="width: 80px; height: 80px" class="q-ma-sm rounded-borders" />
            
            <q-card-section class="col">
              <div class="text-subtitle1 text-weight-bold">{{ item.product_name }}</div>
              <div class="text-primary text-weight-bold">{{ item.product_price.toLocaleString() }}원</div>
            </q-card-section>

            <q-card-section class="row items-center q-gutter-x-sm">
              <q-btn icon="remove" size="sm" flat round @click="cartStore.updateQuantity(item.product_id, item.quantity - 1)" />
              <div class="text-subtitle1">{{ item.quantity }}</div>
              <q-btn icon="add" size="sm" flat round @click="cartStore.updateQuantity(item.product_id, item.quantity + 1)" />
              <q-btn icon="delete" color="red" flat round @click="cartStore.removeFromCart(item.product_id)" />
            </q-card-section>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-lg bg-white q-pa-md">
          <div class="row justify-between items-center">
            <div class="text-h6">총 결제 금액</div>
            <div class="text-h5 text-primary text-weight-bolder">{{ cartStore.totalPrice.toLocaleString() }}원</div>
          </div>
          <q-btn 
  color="primary" 
  label="주문하기" 
  class="full-width q-mt-md" 
  size="lg" 
  @click="$router.push('/pay')" 
/>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useCartStore } from '../stores/cart';
const cartStore = useCartStore();
</script>