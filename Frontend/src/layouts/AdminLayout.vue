<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
       

        <q-btn flat no-caps to="/" class="q-ml-sm">
          <q-toolbar-title class="text-weight-bold">
            <span class="text-blue-6">AB</span><span class="text-red-6">SOL</span>
            <span class="text-subtitle2 q-ml-sm text-grey-5">Admin</span>
          </q-toolbar-title>
        </q-btn>

        <q-space />

        <div class="row q-gutter-sm q-mr-md">
          <q-btn flat dense icon="people" label="회원관리" to="/admin/users" />
          <q-btn flat dense icon="inventory_2" label="상품관리" to="/admin/products" />
          <q-btn flat dense icon="build" label="수리이력" to="/admin/repairs" />
          <q-btn flat dense icon="calculate" label="견적이력" to="/admin/estimates" />
          <q-btn flat dense icon="receipt_long" label="상품구매이력" to="/admin/orders" />
          <q-btn flat round dense icon="home"  label="사용자페이지" to="/" class="q-mr-sm" />
         
        </div>

        <q-separator dark vertical inset class="q-mx-sm" />

        <div class="row no-wrap">
          <q-btn flat round dense icon="logout" @click="handleLogout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const drawer = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>