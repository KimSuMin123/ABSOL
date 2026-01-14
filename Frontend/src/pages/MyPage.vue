<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1000px;">
      <UserProfileCard />

      <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
        <q-tab name="orders" label="구매내역" />
        <q-tab name="repairs" label="수리이력" />
        <q-tab name="estimates" label="견적이력" /> <q-tab name="mypc" label="My PC" />
        <q-tab name="settings" label="정보수정/플랜" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated class="bg-transparent q-mt-md">
        <q-tab-panel name="orders" class="q-pa-none">
          <OrderHistory />
        </q-tab-panel>

        <q-tab-panel name="repairs" class="q-pa-none">
          <RepairHistory />
        </q-tab-panel>

        <q-tab-panel name="estimates" class="q-pa-none">
          <EstimateHistory />
        </q-tab-panel>

        <q-tab-panel name="mypc">
          <MyPcSpecs />
        </q-tab-panel>

        <q-tab-panel name="settings">
          <UserSettings />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import UserProfileCard from '../components/UserProfileCard.vue';
import OrderHistory from '../components/OrderHistory.vue';
import RepairHistory from '../components/RepairHistory.vue';
import MyPcSpecs from '../components/MyPcSpecs.vue';
import EstimateHistory from '../components/EstimateHistory.vue';
import UserSettings from '../components/UserSettings.vue';

// 기본 탭 설정
const tab = ref('orders');
</script>