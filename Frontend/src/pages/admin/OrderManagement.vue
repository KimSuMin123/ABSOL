<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="bg-white q-pa-md shadow-1 rounded-borders q-mb-lg">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-bold text-blue-9">주문 마스터 관리 (실시간 필터)</div>
        <q-space />
        <q-btn color="grey-7" icon="refresh" label="데이터 동기화" @click="loadOrders" flat />
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-6">
          <q-input 
            v-model="searchQuery" 
            label="주문자/상품명 실시간 검색" 
            dense outlined 
            clearable
          >
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6">
          <q-select 
            v-model="selectedStatusFilter" 
            :options="['전체', '접수완료', '결제완료', '조립중', '조립완료', '상품출고', '배송중', '수령완료']" 
            label="진행 단계 필터" 
            dense outlined 
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-if="filteredOrders.length === 0" class="col-12 text-center q-pa-xl text-grey-6 bg-white rounded-borders shadow-1">
        검색 조건에 맞는 주문 내역이 없습니다.
      </div>

      <div v-for="order in filteredOrders" :key="order.order_id" class="col-12">
        <q-card flat bordered class="order-card shadow-1">
          <q-card-section horizontal>
            <div class="col-2 flex flex-center q-ma-sm rounded-borders" :class="getStatusBgColor(order.status)" style="max-width: 120px; height: 120px">
              <q-icon :name="getStatusIcon(order.status)" size="64px" :color="getStatusColor(order.status)" />
            </div>

            <q-card-section class="col-3 q-py-md">
              <div class="row items-center q-mb-xs">
                <q-badge :color="getStatusColor(order.status)" class="q-mr-sm">{{ order.status }}</q-badge>
                <div class="text-h6 text-weight-bold ellipsis">{{ order.product_name }}</div>
              </div>
              <div class="text-subtitle2 text-primary">내부 주문 번호 : {{ order.order_id }}</div>
             <div class="text-caption text-grey-7">주문자 이름 : {{ order.customer_name }}</div>
              <div class="text-caption text-grey-7"><q-icon name="phone" size="xs" /> {{ order.phone }}</div>
                 <div class="text-caption text-grey-7">토스 주문 아이디 : {{ order.toss_order_id }}</div>
                    <div class="text-caption text-grey-7">토스 결제 키 : {{ order.payment_key }}</div>

            </q-card-section>

            <q-card-section class="col-2 q-py-md flex flex-center border-left">
              <div class="text-center">
                <div class="text-body2 text-weight-bold text-blue-9">{{ order.total_price?.toLocaleString() }}원</div>
                <div class="text-caption text-grey-6">{{ order.createdAt?.substring(0, 10) }}</div>
          <div class="q-mt-md q-pa-sm bg-grey-1 rounded-borders border-grey-3">
  <div class="row items-center q-gutter-x-sm">
    <template v-if="order.pdf_path">
      <q-btn 
        label="주문서 PDF" 
        icon="picture_as_pdf" 
        color="red-9" 
        flat
        dense
        size="sm"
        @click="openPdf(order.pdf_path)"
      >
        <q-tooltip>PDF 파일 열기</q-tooltip>
      </q-btn>
    </template>
    <div v-else class="text-caption text-grey-5 q-px-xs">PDF 없음</div>

    <q-separator vertical inset class="q-mx-xs" />

    <template v-if="order.product_ids && parseIds(order.product_ids).length > 0">
      <div class="row q-gutter-x-xs">
        <template v-for="id in parseIds(order.product_ids)" :key="id">
          <q-btn
            label="제품"
            icon="launch"
            color="primary"
            flat
            dense
            size="sm"
            @click="openProductPage(id)"
          >
            <q-tooltip>제품 상세: https://absoltech.kr/product/{{ id }}</q-tooltip>
          </q-btn>
        </template>
      </div>
    </template>
    <div v-else class="text-caption text-grey-5 q-px-xs">연결 제품 없음</div>
  </div>
</div>

                <q-badge :color="order.is_paid ? 'green' : 'red'" outline class="q-mt-xs">
                  {{ order.is_paid ? '결제완료' : '미결제' }}
                </q-badge>
              </div>
            </q-card-section>

           <q-card-section class="col-5 q-py-md border-left row q-col-gutter-sm items-center">
            <template v-if="!order.product_name?.includes('멤버십 업그레이드')">
  <div class="col-6">
    <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">단계 변경</div>
    <q-select
      v-model="order.status"
      :options="['접수완료', '조립중', '조립완료', '결제완료','상품출고', '배송중', '수령완료']"
      dense outlined bg-color="white"
      @update:model-value="(val) => updateOrderData(order, { status: val })"
    />
  </div>
  
  <div class="col-6">
    <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">배송사 선택</div>
    <q-select
      v-model="order.delivery_company"
      :options="companyOptions"
      option-value="Code"
      option-label="Name"
      emit-value
      map-options
      dense outlined bg-color="white"
      @update:model-value="(val) => updateOrderData(order, { delivery_company: val })"
    />
  </div>

  <div class="col-12">
    <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">운송장 번호</div>
    <q-input
      v-model="order.tracking_number"
      dense outlined bg-color="white"
      placeholder="입력 후 Enter"
      @keyup.enter="updateOrderData(order, { tracking_number: order.tracking_number })"
    >
      <template v-slot:append><q-icon name="save" size="xs" color="primary" /></template>
    </q-input>
  </div>
  </template>
</q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-inner-loading :showing="loading"><q-spinner-grid size="50px" color="primary" /></q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // computed 추가
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const orders = ref([]); // 원본 데이터
const loading = ref(false);
const searchQuery = ref('');
const selectedStatusFilter = ref('전체');
const openPdf = (path) => {
  if (!path) return;
  // 서버 주소와 경로를 결합 (서버 주소는 본인 환경에 맞게 수정)
  const baseUrl = 'https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/';
  // 백엔드에서 저장된 path가 'uploads/pdfs/...' 형태라면 그대로 붙여서 엽니다.
  window.open(baseUrl + path, '_blank');
};

// 2. product_ids (문자열 또는 배열)를 안전하게 배열로 변환하는 함수
const parseIds = (data) => {
  if (!data) return [];
  try {
    // 이미 배열인 경우
    if (Array.isArray(data)) return data;
    // "[3, 4]" 형태의 문자열인 경우 파싱
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    // 단순 숫자나 문자열인 경우
    return [data];
  }
}
// [핵심] 프론트엔드 실시간 필터 로직
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // 1. 검색어 체크 (고객명, 상품명, 전화번호)
    const matchesSearch = 
      (order.customer_name || '').includes(searchQuery.value || '') || 
      (order.product_name || '').includes(searchQuery.value || '') ||
      (order.phone || '').includes(searchQuery.value || '');

    // 2. 상태 필터 체크
    const matchesStatus = 
      selectedStatusFilter.value === '전체' || order.status === selectedStatusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const loadOrders = async () => {
  loading.value = true;
  try {
    // 필터링은 프론트에서 하므로 쿼리 파라미터 없이 전체 로드
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/orders');
    orders.value = res.data.data;
  } catch (error) {
    $q.notify({ color: 'negative', message: '데이터 로드 실패' });
  } finally {
    loading.value = false;
  }
};

const updateOrderData = async (order, payload) => {
  try {
    await axios.patch(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/orders/${order.order_id}`, payload);
    $q.notify({ color: 'positive', message: '업데이트 완료', timeout: 500 });
    // 업데이트 후 원본 데이터의 상태를 최신화 (필요시 loadOrders 재호출)
  } catch (error) {
    $q.notify({ color: 'negative', message: '업데이트 실패' });
    loadOrders();
  }
};

const getStatusColor = (status) => {
  const colors = { '접수완료': 'grey-7', '조립중': 'orange-8', '조립완료': 'blue-8', '상품출고': 'indigo-8', '배송중': 'green-8', '수령완료': 'purple-8' };
  return colors[status] || 'grey';
};

const getStatusBgColor = (status) => {
  const bgs = { '접수완료': 'bg-grey-2', '조립중': 'bg-orange-1', '조립완료': 'bg-blue-1', '상품출고': 'bg-indigo-1', '배송중': 'bg-green-1', '수령완료': 'bg-purple-1' };
  return bgs[status] || 'bg-grey-1';
};

const getStatusIcon = (status) => {
  const icons = { '접수완료': 'assignment', '조립중': 'build', '조립완료': 'check_circle', '상품출고': 'outbox', '배송중': 'local_shipping', '수령완료': 'home' };
  return icons[status] || 'help';
};
const companyOptions = ref([]);

// 택배사 리스트 로드 함수
const loadCompanyList = async () => {
  try {
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/delivery/companyList');
    // 스마트택배 응답 구조인 res.data.Company 사용
    companyOptions.value = res.data.Company || [];
  } catch (error) {
    console.error('택배사 목록 로드 실패');
  }
};
const openProductPage = (id) => {
  if (!id) return;
  const url = `https://absoltech.kr/product/${id}`;
  window.open(url, '_blank');
};



onMounted(() => {
  loadOrders();
  loadCompanyList(); // 페이지 로드 시 택배사 리스트 호출
});
</script>