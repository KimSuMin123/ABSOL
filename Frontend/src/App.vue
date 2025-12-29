<template>
  <q-app>
    <q-layout view="lHh Lpr lFf">
      <q-page-container>
        <q-page class="flex flex-center col">
          <div class="text-center">
            <h4 class="q-mb-lg">PC 조립 견적 요청</h4>
            <EstimateForm />
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-app>
</template>

<script setup>
import EstimateForm from './components/EstimateForm.vue' // 상대 경로 확인!

</script>