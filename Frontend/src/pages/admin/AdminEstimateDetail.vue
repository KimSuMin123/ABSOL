<template>
  <div class="admin-quote-container">
    <div class="editor-side">
      
        <div class="total-display">
          <span style="font-size:x-large; font-weight: 700;">총 견적금액 : {{ totalPrice.toLocaleString() }}원</span>
        </div>
     

      <div class="form-body">
        <div class="section-title">📦 하드웨어 부품 구성</div>
        <div v-for="item in partsList" :key="item.key" class="part-input-group">
          <div class="part-name">{{ item.label }}</div>
          <div class="inputs">
            
               <input v-model="form[`${item.key}_name`]" placeholder="모델명 입력" class="name-input" />
              <input v-model="form[`${item.key}_sn`]" placeholder="제품 코드" class="name-input" />
              <input v-model.number="form[`${item.key}_price`]" type="number" placeholder="단가" class="name-input" />
              
         
          </div>
        </div>
      </div>

      <div class="editor-footer">
        <button @click="submitAndDownload" class="btn-save">
          <q-icon name="picture_as_pdf" size="sm" class="q-mr-sm" /> 
          PC 정보 및 PDF 저장하기
        </button>
      </div>
    </div>

    <div class="preview-side">
      <div class="preview-wrapper">
        <div id="pdf-area" ref="pdfArea" class="quote-paper">
          <div class="watermark">
    <span class="wm-blue">AB</span><span class="wm-red">SOL</span>
  </div>
         <div class="quote-header">
            <div class="quote-title">온라인 견적서</div>
            <div class="quote-logo-wrapper">
              <span class="quote-logo-blue">AB</span>
              <span class="quote-logo-red">SOL</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box customer">
              <table>
                <tr><th>견적번호</th><td>{{ todayDate }}{{ form.estimate_id }}</td></tr>
                <tr><th>고객명</th><td>{{ form.customer_name }} 님</td></tr>
                <tr><th>연락처</th><td>{{ form.contact }}</td></tr>
                <tr><th>주소</th><td class="addr-text">{{ form.address }}</td></tr>
              </table>
            </div>
            <div class="info-box supplier">
              <div class="stamp-area">인</div>
              <table>
                <tr><th>사업자 번호</th><td>587-40-01502</td></tr>
                <tr><th>상호</th><td>ABSOL</td></tr>
                <tr><th>대표자</th><td>이용관 (인)</td></tr>
                <tr><th>연락처</th><td>010-9857-7531</td></tr>
              </table>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th width="40">No</th>
                <th width="80">분류</th>
                <th>제품명</th>
                <th> 제품 코드</th>
                <th width="110" class="text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in partsList" :key="item.key">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="text-center">{{ item.label }}</td>
               <td class="text-left">
  <div class="item-info-row text-center">
    <span class="item-name">{{ form[`${item.key}_name`] || '-' }}</span>
   
  </div>
</td>
              <td class="text-left">
  <div class="item-info-row text-center">
     <span class="item-name"v-if="form[`${item.key}_sn`]">
      {{ form[`${item.key}_sn`] || '-'}}
    </span>
    </div></td>
                <td class="text-right text-bold">
                  {{ (form[`${item.key}_price`] || 0).toLocaleString() }}원
                </td>
              </tr>
            </tbody>
          </table>

          <div class="final-price-area">
            <div class="price-row">
              <span class="price-label">합계 금액 (VAT 포함)</span>
              <span class="total-val">{{ totalPrice.toLocaleString() }}원</span>
            </div>
          </div>
             <p style="margin-top:20px">* 본 견적서는 발행일로부터 7일간 유효합니다.</p>
   
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRouter } from 'vue-router';
const router = useRouter();
const pdfArea = ref(null);
const todayDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');

const partsList = [
  { label: 'CPU', key: 'cpu' },
  { label: '쿨러', key: 'cooler' },
  { label: '메인보드', key: 'mb' },
  { label: '메모리', key: 'ram' },
  { label: '그래픽', key: 'vga' },
  { label: '파워', key: 'ps' },
  { label: 'SSD/HDD', key: 'storage0' },
  { label: '케이스', key: 'case' },
  { label: '기타', key: 'etc' }
];

const form = reactive({
  user_id: '',
  estimate_id: '',
  customer_name: '',
  contact: '',
  address: '',
  pc_nickname: 'ABSOL_PC_견적서',
  ...Object.fromEntries(partsList.flatMap(p => [
    [`${p.key}_name`, ''], 
    [`${p.key}_sn`, ''], 
    [`${p.key}_warranty`, true], 
    [`${p.key}_price`, 0]
  ]))
});

const totalPrice = computed(() => {
  return partsList.reduce((acc, curr) => acc + (form[`${curr.key}_price`] || 0), 0);
});

onMounted(() => {
  const savedState = window.history.state?.estimateData;
  if (savedState) {
    form.user_id = savedState.user_id;
    form.estimate_id = savedState.estimate_id;
    form.customer_name = savedState.name;
    form.contact = savedState.contact;
    form.address = savedState.address;
  }
});

const submitAndDownload = async () => {
  try {
    const element = pdfArea.value;
    const wrapper = document.querySelector('.preview-wrapper');

    // [중요] 캡처 시 겹침 방지를 위해 임시로 scale 해제
    const originalTransform = wrapper.style.transform;
    wrapper.style.transform = 'none';

    // 렌더링 대기 (브라우저가 레이아웃을 다시 계산할 시간을 줌)
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 2,             // 3보다 2가 파일 용량과 정밀도 면에서 안정적일 수 있음
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      // 요소의 실제 크기를 강제 지정
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight
    });

    // 캡처 후 원래 스케일로 복구
    wrapper.style.transform = originalTransform;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    
    const pdfBlob = pdf.output('blob');
    const formData = new FormData();
    formData.append('data', JSON.stringify(form));
    formData.append('pdfFile', pdfBlob, `${form.pc_nickname}.pdf`);

    const response = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates/save-detail', formData);

    if (response.data.success) {
      try {
        await axios.patch(`https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates/${form.estimate_id}/status`, {
          status: '견적발송완료'
        });
      } catch (statusErr) {
        console.error('상태 업데이트 실패:', statusErr);
        // 상태 변경 실패는 경고 정도로 처리 (파일은 이미 저장되었으므로)
      }
      pdf.save(`${form.pc_nickname}.pdf`);
      alert('견적서가 서버에 저장되고 PDF 다운로드가 시작되었습니다.');
     router.push('/admin/estimates');
    }
  } catch (err) {
    console.error(err);
    alert('저장 실패: 네트워크 상태를 확인하세요.');
  }
};
</script>

<style scoped>
  .watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg); /* 중앙 배치 및 회전 */
  font-size: 150px; /* 아주 크게 설정 */
  font-weight: 900;
  opacity: 0.08; /* 매우 흐리게 (0.05 ~ 0.1 권장) */
  pointer-events: none; /* 클릭 방해 금지 */
  user-select: none;
  z-index: 0;
  white-space: nowrap;
}

.wm-blue { color: #2294f2; }
.wm-red { color: #f44336; }

/* 기존 내용물들이 워터마크 위로 올라오도록 설정 */
.quote-header, .info-grid, .items-table, .final-price-area {
  position: relative;
  z-index: 1;
}
.admin-quote-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 정확히 50:50 분할 */
}

/* 왼쪽: 에디터 섹션 */
.editor-side {
  background: white;
  border-right: 1px solid #cfd8dc;
  display: flex;
  flex-direction: column;
  height: 95vh;
}

.editor-header {
  padding: 10px 20px;
  background: #1a237e;
  color: white;
}

.total-display {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.total-display .value {
  font-size: 26px;
  font-weight: 800;
  display: block;
  color: #ffeb3b;
}

.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #1a237e;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #1a237e;
}

.part-input-group {
  margin-bottom: 15px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.part-name { font-weight: bold; margin-bottom: 8px; color: #3949ab; font-size: 14px; }
.name-input { width: 30%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px; font-size: 14px; margin-left: 2%;}
.sub-inputs { display: grid; grid-template-columns: 1fr 120px 60px; gap: 8px; align-items: center; }
.sn-input, .price-input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; }

.editor-footer { padding: 15px; background: #fff; border-top: 1px solid #eee; }
.btn-save {
  width: 100%; padding: 16px; background: #3949ab; color: white; border: none; font-weight: bold; font-size: 16px; border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.btn-save:hover { background: #1a237e; }

/* 오른쪽: 프리뷰 섹션 */
.preview-side {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px 0;
  background: #90a4ae; /* 대비가 잘 되는 배경색 */
}

.preview-wrapper {
  transform: scale(0.65); /* 반반 화면에 맞게 적절히 축소 */
  transform-origin: top center;
}

.quote-paper {
  width: 210mm;
  height: 297mm;
  background: white;
  padding: 60px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);position: relative; /* 중요: 워터마크 absolute의 기준 */
  overflow: hidden;   /* 워터마크가 삐져나가지 않게 */
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 4px solid #1a237e;
  padding-bottom:10px;
  margin-bottom: 20px;
}

.quote-title { font-size: 44px; font-weight: 900; letter-spacing: 6px; color: #1a1a1a;}
.quote-logo-red { font-size: 28px; font-weight: 900; color: #f44336; }
.quote-logo-blue { font-size: 28px; font-weight: 900; color:#2294f2 }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
.info-box { border: 1px solid #ddd; padding: 15px; border-radius: 4px; }
.info-box table { width: 100%; border-collapse: collapse; font-size: 14px; }
.info-box th { text-align: left; color: #666; width: 80px; padding: 5px 0; }
.info-box td { font-weight: bold; }
.addr-text { font-size: 12px; line-height: 1.2; }

.supplier { position: relative; background: #fcfcfc; }
.stamp-area {
  position: absolute; right: 25px; bottom: 20px;
  width: 60px; height: 60px; border: 3px solid rgba(211, 47, 47, 0.4);
  border-radius: 50%; color: rgba(211, 47, 47, 0.4);
  display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;
}

.items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
.items-table th { background: #f1f3f4; border-top: 3px solid #333; padding: 12px; font-size: 15px; }
.item-sn { font-size: 12px; color: #888; margin-top: 4px; }
/* 텍스트 겹침 방지를 위해 최소 높이와 라인 높이 고정 */
.items-table td {
  padding: 12px 8px; /* 패딩 약간 조정 */
  border-bottom: 1px solid #eee;
  font-size: 14px; /* PDF 폰트 가독성을 위해 살짝 조정 가능 */
  line-height: 1.4; /* 줄 간격 명시 */
  word-break: break-all; /* 긴 텍스트 줄바꿈 강제 */
  vertical-align: middle;
}

.item-info-row {
  display: block; /* Flex보다 안정적인 Block으로 설정 */
  min-height: 20px;
}

.item-name {
  display: inline-block;
  max-width: 100%;
  white-space: normal; /* 이름이 길 때 겹치지 않고 아래로 흐르게 함 */
}

/* 캡처 시 폰트가 뭉치는 현상 방지 */
.quote-paper {
  font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
  -webkit-font-smoothing: antialiased;
}
.final-price-area {
  background: #f8f9fa; padding: 25px; border-radius: 8px; text-align: right;
  border-top: 3px solid #1a237e;
}
.price-label { font-size: 18px; color: #444; }
.total-val { font-size: 32px; font-weight: 900; color: #d32f2f; margin-left: 20px; }

.quote-notice { margin-top: 50px; padding: 25px; background: #fafafa; border: 1px solid #eee; }
.notice-title { font-weight: bold; margin-bottom: 10px; font-size: 15px; }
.quote-notice ul { padding-left: 20px; font-size: 13px; color: #555; line-height: 1.6; }
</style>