<template>
  <div class="container">
    <div class="editor-section">
   
        <h5>💻 고객 PC 견적서 작성</h5>
    
      
      <div class="form-scroll-area">
        <div v-for="item in partsList" :key="item.key" class="part-row">
          <div class="part-label">{{ item.label }}</div>
          <div class="part-inputs">
            <input v-model="form[`${item.key}_name`]" placeholder="모델명" class="flex-2" />
            <input v-model="form[`${item.key}_sn`]" placeholder="시리얼 번호" class="flex-2" />
            <input v-model.number="form[`${item.key}_price`]" type="number" placeholder="가격" class="flex-1" />
            
            <label class="checkbox-container">
              <input type="checkbox" v-model="form[`${item.key}_warranty`]" />
              <span class="checkmark"></span>
              <span class="label-text">보증</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button @click="submitAndDownload" class="btn-submit">
          💾 PC 정보 및 PDF 저장
        </button>
      </div>
    </div>

    <div class="preview-section">
      <div id="pdf-area" ref="pdfArea" class="invoice-box">
        <h1 class="invoice-title">ABSOL PC 견적서</h1>
        
        <div class="invoice-info">
          <div class="info-left">
            <p><strong>고객 정보:</strong>  {{ form.user_id }}</p>
            <p><strong>날짜:</strong> {{ new Date().toLocaleDateString() }}</p>
          </div>
          <div class="info-right">
            <p><strong>대표자:</strong>이용관</p>
            <p><strong>연락처:</strong>010-9857-7531</p>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>상세 모델명 / 시리얼</th>
              <th class="text-right">금액</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in partsList" :key="item.key">
              <td class="font-bold">{{ item.label }}</td>
              <td>
                <div class="model-name">{{ form[`${item.key}_name`] || '-' }}</div>
                <div class="serial-no">{{ form[`${item.key}_sn`] }}</div>
              </td>
              <td class="text-right">
                ₩ {{ (form[`${item.key}_price`] || 0).toLocaleString() }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2">총 합계 금액 (Total)</td>
              <td class="text-right">₩ {{ totalPrice.toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="invoice-footer">
          본 견적서는 시스템에 의해 자동 생성되었습니다.
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

// 1. 백엔드 모델과 필드명을 100% 일치시킴 (cooler, etc 추가)
const partsList = [
  { label: 'CPU', key: 'cpu' },
  { label: 'CPU 쿨러', key: 'cooler' },
  { label: '메인보드', key: 'mb' },
  { label: '메모리', key: 'ram' },
  { label: '그래픽카드', key: 'vga' },
  { label: '파워', key: 'ps' },
  { label: '저장장치 0', key: 'storage0' },
  { label: '저장장치 1', key: 'storage1' },
  { label: '저장장치 2', key: 'storage2' },
  { label: '케이스', key: 'case' },
  { label: '기타', key: 'etc' }
];

const form = reactive({
  estimate_id: null,
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

// 2. 백엔드 서버 전송 함수
const submitAndDownload = async () => {
  try {
    // A. PDF 생성 로직
    const canvas = await html2canvas(pdfArea.value, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // B. 전송을 위한 Blob 생성
    const pdfBlob = pdf.output('blob');

    // C. FormData 구성 (파일 + JSON)
    const formData = new FormData();
    formData.append('data', JSON.stringify(form)); // 핵심: 백엔드에서 JSON.parse()로 받을 데이터
    formData.append('pdfFile', pdfBlob, `${form.pc_nickname}.pdf`);

    // D. 백엔드 API 호출 (URL을 본인의 서버 주소에 맞게 수정하세요)
    const response = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimate/save-detail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      // E. 서버 저장 성공 시 로컬 다운로드 실행
      pdf.save(`${form.pc_nickname}.pdf`);
      alert('서버 저장 및 PDF 다운로드가 완료되었습니다!');
    }
  } catch (err) {
    console.error('전송 에러:', err);
    const errorMsg = err.response?.data?.message || '서버와의 통신 중 오류가 발생했습니다.';
    alert(`저장 실패: ${errorMsg}`);
  }
};
</script>

<style scoped>
/* 전체 레이아웃 */
.container {
  display: flex;
  flex-direction: row;
  gap: 30px;
  padding: 30px;
  background-color: #f4f7f9;
  min-height: 100vh;
  font-family: 'Pretendard', sans-serif;
}

/* 입력 섹션 스타일 */
.editor-section {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.card-header {
  background: #2563eb;
  color: white;
  padding: 20px;
  border-radius: 12px 12px 0 0;
}

.form-scroll-area {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.input-group-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-field label {
  font-size: 13px;
  font-weight: bold;
  color: #666;
}

.section-title {
  font-size: 16px;
  color: #2563eb;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

/* 부품 행 스타일 */
.part-row {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.part-label {
  font-weight: 800;
  font-size: 14px;
  color: #334155;
  margin-bottom: 8px;
}

.part-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}

.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

input[type="text"], input[type="number"] {
  border: 1px solid #cbd5e1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

/* 체크박스 커스텀 */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
}

.label-text {
  font-size: 12px;
  font-weight: bold;
  color: #64748b;
}

.form-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  text-align: right;
}

.btn-submit {
  background: #1d4ed8;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #1e40af;
}

/* PDF 미리보기 스타일 */
.preview-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.invoice-box {
  width: 210mm;
  min-height: 157mm;
  background: white;
  padding: 60px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  box-sizing: border-box;
}

.invoice-title {
  text-align: center;
  font-size: 42px;
  letter-spacing: 10px;
  border-bottom: 4px solid #1e293b;
  margin-bottom: 40px;
  padding-bottom: 20px;
}

.invoice-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table th {
  background: #1e293b;
  color: white;
  padding: 12px;
  text-align: left;
}

.invoice-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.model-name { font-weight: 600; font-size: 14px; }
.serial-no { color: #94a3b8; font-size: 12px; }
.text-right { text-align: right; }

.total-row {
  background: #eff6ff;
  font-size: 20px;
  font-weight: bold;
  color: #1e40af;
}

.invoice-footer {
  margin-top: 80px;
  text-align: center;
  color: #cbd5e1;
  font-style: italic;
}

/* 반응형 */
@media (max-width: 1200px) {
  .container { flex-direction: column; }
  .invoice-box { width: 100%; min-height: auto; }
}
</style>