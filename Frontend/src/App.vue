<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
<RegisterPage/>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
// import EstimateForm from './components/EstimateForm.vue'
// import RepairForm from './components/RepairForm.vue'
// import AdminPage from './pages/AdminPage.vue'

import RegisterPage from './pages/RegisterPage.vue'
</script>