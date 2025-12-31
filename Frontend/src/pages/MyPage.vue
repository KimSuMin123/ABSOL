<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="container q-mx-auto" style="max-width: 1000px;">
      <q-card flat bordered class="q-mb-md bg-white shadow-1">
        <q-card-section class="row items-center q-py-lg">
          <q-avatar size="80px" color="blue-1" text-color="primary" icon="person" class="shadow-1" />
          <div class="q-ml-lg">
            <div class="row items-center q-gutter-x-sm">
              <div class="text-h5 text-weight-bolder">{{ userStore.user.name }}님</div>
              <q-badge :color="getPlanColor(userStore.user.level)" class="q-pa-xs text-weight-bold">
                {{ userStore.user.level || 'Basic' }} 멤버십
              </q-badge>
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">{{ userStore.user.login_id }}</div>
          </div>
          <q-space />
          <div class="text-right">
            <div class="text-caption text-grey-6">가입일</div>
            <div class="text-subtitle2">{{ userStore.user.createdAt?.substring(0, 10) || '2025-12-30' }}</div>
          </div>
        </q-card-section>
      </q-card>

      <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
        <q-tab name="orders" label="구매내역" />
        <q-tab name="repairs" label="수리이력" />
        <q-tab name="mypc" label="My PC" />
        <q-tab name="settings" label="정보수정/플랜" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="bg-transparent q-mt-md">
        
        <q-tab-panel name="orders" class="q-pa-none">
          <div v-if="orders.length === 0" class="text-center q-pa-xl bg-white rounded-borders shadow-1">
            <q-icon name="shopping_cart" size="64px" color="grey-4" />
            <div class="text-grey-6 q-mt-md">구매 내역이 없습니다.</div>
          </div>
          <q-card v-for="order in orders" :key="order.order_id" flat bordered class="q-mb-sm bg-white order-card">
            <q-card-section class="row items-center">
              <div class="col">
                <div class="row items-center q-gutter-x-sm">
                  <q-badge :color="order.is_paid ? 'blue' : 'orange'">{{ order.is_paid ? '결제완료' : '미결제' }}</q-badge>
                  <div class="text-subtitle1 text-weight-bold">{{ order.product_name }}</div>
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">주문번호: {{ order.order_id }} | 날짜: {{ order.createdAt.substring(0, 10) }}</div>
              </div>
              <div class="text-right">
                <div class="text-h6 text-primary">{{ order.total_price.toLocaleString() }}원</div>
                <q-btn v-if="order.tracking_number" label="배송조회" size="sm" color="secondary" outline @click="trackPackage(order.tracking_number)" />
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="repairs" class="q-pa-none">
          <div v-if="repairs.length === 0" class="text-center q-pa-xl bg-white rounded-borders shadow-1">
            <q-icon name="build" size="64px" color="grey-4" />
            <div class="text-grey-6 q-mt-md">수리 이력이 없습니다.</div>
          </div>
          <q-card v-for="repair in repairs" :key="repair.repair_id" flat bordered class="q-mb-sm bg-white">
            <q-card-section>
              <div class="row justify-between items-center">
                <q-badge color="green">{{ repair.status || '접수완료' }}</q-badge>
                <div class="text-caption text-grey">{{ repair.createdAt.substring(0, 10) }}</div>
              </div>
              <div class="text-subtitle1 q-mt-sm text-weight-bold">{{ repair.symptoms }}</div>
              <div class="text-caption text-grey-8">{{ repair.repair_type }} | {{ repair.full_address }}</div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="mypc">
          <q-card flat bordered class="bg-white q-pa-md shadow-1">
            <div class="text-h6 q-mb-md font-weight-bold"><q-icon name="computer" /> 보유 PC 사양</div>
            <div v-if="myPc" class="row q-col-gutter-md">
              <div class="col-12 col-sm-6" v-for="(val, key) in myPcSpecs" :key="key">
                <q-item class="bg-grey-1 rounded-borders">
                  <q-item-section avatar><q-icon :name="getIcon(key)" color="primary" /></q-item-section>
                  <q-item-section>
                    <q-item-label caption>{{ key.toUpperCase() }}</q-item-label>
                    <q-item-label class="text-weight-bold">{{ val }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </div>
            <div v-else class="text-center q-py-lg">등록된 PC 정보가 없습니다.</div>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="settings">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-white shadow-1">
                <q-card-section class="text-h6 text-weight-bold">내 정보 수정</q-card-section>
                <q-card-section class="q-gutter-y-sm">
                  <q-input v-model="userStore.user.login_id" label="회원번호(ID)" filled readonly />
                  <q-input v-model="editForm.name" label="성함" outlined dense />
                  <q-input v-model="editForm.phone" label="연락처" mask="###-####-####" outlined dense />
                  <q-input v-model="editForm.address" label="주소" outlined dense type="textarea" rows="2" />
                  <q-btn label="수정 내용 저장" color="primary" class="full-width q-mt-md" unelevated @click="updateProfile" />
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-white shadow-1">
                <q-card-section class="text-h6 text-weight-bold text-primary">멤버십 플랜 업그레이드</q-card-section>
                <q-card-section class="q-pa-none">
                  <q-list separator>
                    <q-item v-for="plan in planOptions" :key="plan.name" clickable v-ripple @click="upgradePlan(plan)" :active="userStore.user.level === plan.name" active-class="bg-blue-1">
                      <q-item-section>
                        <q-item-label class="text-weight-bold">{{ plan.name }}</q-item-label>
                        <q-item-label caption>{{ plan.desc }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="text-subtitle1 text-weight-bolder text-primary">{{ plan.price.toLocaleString() }}원</div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useUserStore } from '../stores/user';
import { useQuasar } from 'quasar';
import axios from 'axios';

const userStore = useUserStore();
const $q = useQuasar();
const tab = ref('orders');

const orders = ref([]);
const repairs = ref([]);
const myPc = ref(null);
const myPcSpecs = reactive({ cpu: 'Ryzen 5 7600', gpu: 'RTX 4060 Ti', ram: 'DDR5 32GB', ssd: '1TB NVMe' }); // 예시

const editForm = ref({ ...userStore.user });

const planOptions = [
  { name: 'Basic', desc: '일반고객', price: 0 },
  { name: 'Standard', desc: '1년 부품 무상 보증', price: 33000 },
  { name: 'Green', desc: '관리상품 (구리스, 청소)', price: 55000 },
  { name: 'Silver', desc: '출장비 및 점검비 무료', price: 110000 },
  { name: 'Gold', desc: 'HDD 데이터 무료 복구', price: 165000 },
];

const loadData = async () => {
  if (!userStore.user.id) return;
  try {
    const [ordRes, repRes, pcRes] = await Promise.all([
      axios.get(`http://localhost:3000/api/orders/user/${userStore.user.id}`),
      axios.get(`http://localhost:3000/api/repairs/user/${userStore.user.id}`),
      axios.get(`http://localhost:3000/api/mypc/user/${userStore.user.id}`)
    ]);
    orders.value = ordRes.data.data;
    repairs.value = repRes.data.data;
    myPc.value = pcRes.data.data;
  } catch (e) { console.error(e); }
};

const trackPackage = (num) => {
  // 스마트 택배 조회 연동 (통합 로직)
  window.open(`https://tracker.delivery/#/kr.cjlogistics/${num}`, '_blank');
};

const updateProfile = async () => {
  try {
    const res = await axios.put(`http://localhost:3000/api/users/${userStore.user.id}`, editForm.value);
    if (res.data.success) {
      userStore.setUser(editForm.value);
      $q.notify({ color: 'positive', message: '정보가 수정되었습니다.' });
    }
  } catch (e) { $q.notify({ color: 'negative', message: '수정 실패' }); }
};

const upgradePlan = (plan) => {
  if (userStore.user.level === plan.name) return;
  $q.dialog({
    title: '플랜 업그레이드',
    message: `${plan.name} 플랜으로 결제하시겠습니까? (${plan.price.toLocaleString()}원)`,
    cancel: true,
  }).onOk(async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/users/upgrade', {
        user_id: userStore.user.id,
        plan_name: plan.name,
        price: plan.price
      });
      if (res.data.success) {
        userStore.user.level = plan.name;
        loadData(); // 주문내역 갱신
        $q.notify({ color: 'positive', message: `${plan.name} 등급으로 업그레이드 되었습니다.` });
      }
    } catch (e) { $q.notify({ color: 'negative', message: '결제 처리 오류' }); }
  });
};

const getPlanColor = (lvl) => {
  if (lvl === 'Gold') return 'amber-9';
  if (lvl === 'Silver') return 'grey-5';
  if (lvl === 'Green') return 'green-7';
  if (lvl === 'Standard') return 'blue-7';
  return 'grey-7';
};

const getIcon = (k) => {
  if (k === 'cpu') return 'memory';
  if (k === 'gpu') return 'videogame_asset';
  if (k === 'ram') return 'straighten';
  return 'storage';
};

onMounted(loadData);
</script>

<style scoped>
.order-card { border-radius: 8px; transition: transform 0.2s; }
.order-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
</style>