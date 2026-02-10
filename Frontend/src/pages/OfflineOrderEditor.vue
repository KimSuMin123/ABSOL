<template>
  <div class="admin-quote-container">
    <div class="editor-side">
      <div class="form-body">
        <div class="section-title">👤 고객 및 결제 정보</div>
        <div class="row q-col-gutter-sm q-mb-lg">
          <div class="col-6"><q-input v-model="form.customer_name" label="고객명" dense outlined /></div>
          <div class="col-6"><q-input v-model="form.contact" label="연락처" dense outlined /></div>
          <div class="col-12"><q-input v-model="form.address" label="주소/배송지" dense outlined /></div>
          <div class="col-12">
            <q-select v-model="form.pay_method" :options="['계좌이체', '카드결제', '현금결제', '미결제']" label="결제수단" dense outlined />
          </div>
        </div>

        <div class="section-title row items-center justify-between">
          <span>📦 항목 자유 입력</span>
          <q-btn label="행 추가" color="primary" icon="add" size="sm" @click="addItem" />
        </div>

        <div class="custom-scroll">
          <div v-for="(item, index) in form.items" :key="index" class="part-input-row q-mb-sm">
            <div class="row items-center q-col-gutter-xs">
              <div class="col-2">
                <q-input v-model="item.label" placeholder="분류" dense outlined bg-color="blue-grey-1" />
              </div>
              <div class="col-5">
                <q-input v-model="item.name" placeholder="상품/서비스명" dense outlined />
              </div>
              <div class="col-4">
                <q-input v-model.number="item.price" type="number" suffix="원" dense outlined input-class="text-right" />
              </div>
              <div class="col-1">
                <q-btn icon="close" color="negative" flat dense @click="removeItem(index)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-footer">
        <div class="total-bar">합계: {{ totalPrice.toLocaleString() }}원</div>
        <q-btn 
          label="주문 확정 및 PDF 발행" 
          color="indigo-10" 
          class="full-width q-py-md text-bold" 
          :loading="isSaving"
          @click="submitOfflineOrder" 
        />
      </div>
    </div>

    <div class="preview-side">
      <div class="preview-wrapper">
        <div id="pdf-area" ref="pdfArea" class="quote-paper">
          <div class="watermark"><span class="wm-blue">AB</span><span class="wm-red">SOL</span></div>
          
          <div class="quote-header">
            <div class="quote-title">주문 확인서</div>
            <div class="quote-logo-wrapper">
              <span class="quote-logo-blue">AB</span><span class="quote-logo-red">SOL</span>
            </div>
          </div>

          <div class="order-summary-box">
            <div><strong>No:</strong> {{ todayDate }}-OFF</div>
            <div><strong>결제:</strong> {{ form.pay_method }}</div>
            <div><strong>날짜:</strong> {{ new Date().toLocaleDateString() }}</div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <div class="box-label">구매자 정보</div>
              <table>
                <tr><th>성 함</th><td>{{ form.customer_name || '-' }} 님</td></tr>
                <tr><th>연락처</th><td>{{ form.contact || '-' }}</td></tr>
                <tr><th>주 소</th><td class="small-text">{{ form.address || '매장방문' }}</td></tr>
              </table>
            </div>
            <div class="info-box supplier">
              <div class="box-label">판매자 정보</div>
              <div class="stamp-area">인</div>
              <table>
                <tr><th>상 호</th><td>ABSOL</td></tr>
                <tr><th>대표자</th><td>이용관</td></tr>
                <tr><th>연락처</th><td>010-9857-7531</td></tr>
                <tr><th>사업자 번호</th><td>587-40-01502</td></tr>
              </table>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th width="15%">분류</th>
                <th width="60%">항목 상세 내역</th>
                <th width="25%" class="text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in activeItems" :key="index">
                <td class="text-center">{{ item.label || '기타' }}</td>
                <td>{{ item.name || '상세 내역 없음' }}</td>
                <td class="text-right text-bold">{{ (item.price || 0).toLocaleString() }}원</td>
              </tr>
            </tbody>
          </table>

          <div class="final-price-area">
            <span class="price-label">최종 결제 금액 (VAT포함):</span>
            <span class="total-val">{{ totalPrice.toLocaleString() }}원</span>
          </div>

          <div class="signature-area">
            <p>* 본 확인서는 주문 내역에 대한 계약 효력을 가집니다.</p>
            <p>* 조립 및 세팅 시작 후 변심으로 인한 반품은 불가합니다.</p>
            <div class="sign-line-wrapper">
              <span>위 주문 내용을 확인하였습니다. 성명: </span>
              <span class="sign-line"></span> (인)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const pdfArea = ref(null);
const isSaving = ref(false);
const todayDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');

const form = reactive({
  customer_name: '',
  contact: '',
  address: '',
  pay_method: '계좌이체',
  items: [
  
  ]
});

const addItem = () => form.items.push({ label: '', name: '', price: 0 });
const removeItem = (index) => { if (form.items.length > 1) form.items.splice(index, 1); };

const activeItems = computed(() => form.items.filter(i => i.name || i.price > 0));
const totalPrice = computed(() => form.items.reduce((acc, cur) => acc + (Number(cur.price) || 0), 0));
const submitOfflineOrder = async () => {
  if (!form.customer_name) return alert('고객명을 입력해주세요.');
  isSaving.value = true;
  
  try {
    // --- [1] 제품 먼저 등록하여 ID와 URL 확보 ---
    const validItems = form.items.filter(item => item.name && item.price > 0);
    const productPromises = validItems.map(item => {
      const productData = new FormData();
      productData.append('product_name', item.name);
      productData.append('product_price', item.price);
      productData.append('hardware_info', item.label);
      productData.append('description', `${form.customer_name} 주문서 기반 자동 등록`);
      productData.append('stock', 1);
      productData.append('show', 'no');
      return axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/products', productData);
    });

    const responses = await Promise.all(productPromises);
    const registeredProductIds = responses
      .map(res => res.data.data?.product_id || res.data.data?.id)
      .filter(id => id !== undefined);

    // 제품 URL 생성 (첫 번째 제품 기준 또는 리스트)
    const firstProductId = registeredProductIds[0];
    const productUrl = firstProductId ? `http://localhost:5173/product/${firstProductId}` : '';

    // --- [2] PDF 생성 (이제 productUrl을 PDF에 포함할 수 있음) ---
    // (템플릿에 URL 표시용 ref나 변수를 추가하여 PDF에 찍히게 함)
    // 예: PDF 영역 하단에 "결제 주소: http://localhost:5173/product/7" 텍스트 추가 가능
    
    const element = pdfArea.value;
    const wrapper = document.querySelector('.preview-wrapper');
    const originalTransform = wrapper.style.transform;
    wrapper.style.transform = 'none';
    await new Promise(resolve => setTimeout(resolve, 300));
    const canvas = await html2canvas(element, { scale: 3, useCORS: true });
    wrapper.style.transform = originalTransform;
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    const pdfBlob = pdf.output('blob');

    // --- [3] 상태값 결정 ---
    const isUnpaid = form.pay_method === '미결제';
    const is_paid = isUnpaid ? 0 : 1;
    const state = isUnpaid ? '접수완료' : '결제완료';

    // --- [4] 최종 주문 저장 ---
    const orderFormData = new FormData();
    orderFormData.append('data', JSON.stringify({ 
      ...form, 
      total_price: totalPrice.value,
      product_ids: registeredProductIds,
      is_paid, 
      state
    }));
    orderFormData.append('pdfFile', pdfBlob, `Order_${form.customer_name}.pdf`);

    const res = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/orders/offline', orderFormData);

    if (res.data.success) {
      pdf.save(`주문확인서_${form.customer_name}.pdf`);
      alert(`등록 완료! ${isUnpaid ? '미결제 주문으로 접수되었습니다.' : '결제 완료 처리되었습니다.'}`);
    }
  } catch (err) {
    console.error(err);
    alert('처리 중 에러 발생');
  } finally {
    isSaving.value = false;
  }
};

</script>

<style scoped>
/* 에디터 스타일 */
.admin-quote-container { display: grid; grid-template-columns: 1fr 1fr; height: 100vh; }
.editor-side { padding: 25px; background: #fff; border-right: 1px solid #ddd; overflow-y: auto; }
.section-title { font-weight: bold; font-size: 17px; margin-bottom: 15px; color: #1a237e; border-bottom: 2px solid #1a237e; padding-bottom: 5px; }
.part-input-row { background: #f9f9f9; padding: 10px; border-radius: 5px; }
.total-bar { font-size: 24px; font-weight: 900; color: #d32f2f; text-align: right; margin-bottom: 15px; }

/* PDF 프리뷰 스타일 */
.preview-side { background: #546e7a; display: flex; justify-content: center; padding: 20px; overflow-y: auto; }
.preview-wrapper { transform: scale(0.6); transform-origin: top center; }
.quote-paper { width: 210mm; min-height: 297mm; background: white; padding: 60px; position: relative; }
.watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 150px; opacity: 0.05; font-weight: 900; }
.wm-blue { color: #2294f2; } .wm-red { color: #f44336; }

.quote-header { display: flex; justify-content: space-between; border-bottom: 3px solid #1a237e; padding-bottom: 10px; margin-bottom: 20px; }
.quote-title { font-size: 40px; font-weight: 900; letter-spacing: 5px; }
.quote-logo-blue { color: #2294f2; font-size: 30px; font-weight: 900; }
.quote-logo-red { color: #f44336; font-size: 30px; font-weight: 900; }

.order-summary-box { display: flex; justify-content: space-around; background: #f1f3f4; padding: 10px; margin-bottom: 20px; border-radius: 4px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
.info-box { border: 1px solid #ddd; padding: 15px; position: relative; }
.box-label { position: absolute; top: -10px; left: 10px; background: white; padding: 0 5px; font-size: 12px; color: #666; }
.info-box table { width: 100%; border-collapse: collapse; font-size: 14px; }
.info-box th { width: 60px; text-align: left; padding: 5px 0; color: #777; }
.info-box td { font-weight: bold; }
.stamp-area { position: absolute; right: 20px; bottom: 15px; width: 60px; height: 60px; border: 2px solid rgba(211, 47, 47, 0.3); border-radius: 50%; color: rgba(211, 47, 47, 0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; }

.items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
.items-table th { background: #f8f9fa; border-top: 2px solid #333; padding: 10px; }
.items-table td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; }

.final-price-area { background: #f8f9fa; padding: 20px; text-align: right; border-top: 2px solid #1a237e; }
.total-val { font-size: 32px; font-weight: 900; color: #d32f2f; margin-left: 15px; }

.signature-area { margin-top: 50px; font-size: 13px; color: #666; }
.sign-line-wrapper { margin-top: 40px; text-align: right; font-size: 16px; color: #000; font-weight: bold; }
.sign-line { display: inline-block; width: 150px; border-bottom: 1px solid #000; margin-bottom: -5px; }
</style>