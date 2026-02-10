<template>
  <div class="terms-container q-pa-md">
    <q-card flat bordered class="my-card custom-shadow">
      <q-card-section class="bg-white text-grey-9 q-pb-none">
        <div class="text-h6 text-weight-bold">회원가입 약관 동의</div>
        <p class="text-caption text-grey-7">서비스 이용을 위해 아래 약관에 동의해 주세요.</p>
      </q-card-section>

      <q-form @submit.prevent="onSubmit" class="q-pa-md">
        
        <div class="terms-section q-mb-lg">
          <div class="text-subtitle2 text-weight-bold q-mb-xs">
            앱솔텍 이용약관 <span class="text-primary">(필수)</span>
          </div>
          <div class="terms-scroll-box scroll border-grey q-pa-md bg-grey-1">
            <div class="text-body2 text-grey-9">
              <p class="text-weight-bold">이 약관은 앱솔텍(이하 앱솔텍이라 합니다)가 운영하는 앱솔텍(http://absoltech.kr)에서 제공하는 인터넷 관련 서비스(이하 “서비스”라 합니다)를 이용함에 있어 앱솔텍과 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>

              <p class="text-weight-bold q-mt-md">제 2 조 (정의)</p>
              <p>1. [앱솔텍]이란 [앱솔텍]와(과) 재화 또는 용역(이하 “재화 등”이라 합니다)을 회원에게 제공하기 위하여 컴퓨터 등 정보 통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말하며 아울러 [앱솔텍]을 운영하는 사업자의 의미로도 사용합니다.</p>
              <p>2. [이용자]란 [앱솔텍]에 접속하여 접속 인증코드를 입력하고 [앱솔텍]의 서비스를 이용하는 자를 통칭합니다.</p>
              <p>3. [회원]이라 함은 이용자 중 본 약관에 따라 [앱솔텍]에 개인정보를 제공하여 회원가입을 한 자로서, [앱솔텍]의 정보를 지속적으로 제공받으며 [앱솔텍]이 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</p>
              <p>4. [휴면회원]이라 함은 [앱솔텍]의 서비스에 최종 로그인한 후 연속하여 48개월간 로그인 기록이 없는 회원을 말합니다.</p>

              <p class="text-weight-bold q-mt-md">제 3 조 (약관 등의 명시와 설명 및 개정)</p>
              <p>1. [앱솔텍]은 이 약관의 내용과 상호 및 대표자 성명, 전화번호, 사업자 등록번호, 통신판매업신고번호 등을 이용자가 알 수 있도록 [앱솔텍]의 초기서비스 화면에 게시합니다. 다만, 약관의 내용은 이용자가 연결화면을 통하여 볼 수 있도록 할 수 있습니다.</p>
              <p>2. [앱솔텍]은 이용자가 약관에 동의하기에 앞서 약관에 정하여져 있는 내용 중 청약철회·배송책임·환불조건 등과 같은 중요한 내용을 이용자가 이해할 수 있도록 별도의 연결화면 또는 팝업화면 등을 제공하여 이용자의 확인을 구합니다.</p>
              <p>3. [앱솔텍]은 전자상거래 등에서의 소비자보호에 관한 법률, 약관의 규제에 관한 법률 등 관련법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>
              <p>4. 약관 개정 시 적용일자 7일 전부터 공지하며, 회원에게 불리한 경우 10일 이상의 유예기간을 두고 개별적으로 알립니다.</p>

              <p class="text-weight-bold q-mt-md">제 4 조 (서비스의 중단)</p>
              <p>1. 정보통신설비의 보수 점검, 교체 및 고장 등의 사유 발생 시 서비스 제공을 일시적으로 중단할 수 있습니다.</p>
              <p>2. 사업종목의 전환, 포기 등의 경우 제9조에 정한 방법으로 회원에게 통지합니다.</p>

              <p class="text-weight-bold q-mt-md">제 5 조 (회원 가입)</p>
              <p>1. 이용자는 가입 양식에 따라 정보를 기입한 후 아래 방법 중 하나로 인증을 진행하여 가입합니다.<br>- 접속코드인증 : 사전에 발급된 접속코드 입력<br>- 일반회원가입 : 아이디와 비밀번호를 통한 회원가입</p>
              <p>2. 회원가입 계약의 성립 시기는 [앱솔텍]의 승낙이 회원에게 도달한 시점으로 합니다.</p>

              <p class="text-weight-bold q-mt-md">제 6 조 (회원 탈퇴 및 자격 상실 등)</p>
              <p>1. 회원은 언제든지 탈퇴를 요청할 수 있으며 즉시 처리합니다.</p>
              <p>2. 허위 내용 등록, 대금 미지급, 타인 정보 도용, 업무 방해(폭언 등), 재판매 목적 구매 등의 경우 자격을 제한하거나 박탈할 수 있습니다.</p>

              <p class="text-weight-bold q-mt-md">제 15 조 (개인 정보 보호)</p>
              <p>1. 계약 이행에 필요한 최소한의 정보를 수집하며, 필수 사항 외는 선택 사항으로 합니다.</p>
              <p>2. 개인 식별이 가능한 개인정보 수집 시 반드시 당해 회원의 동의를 받습니다.</p>

              <p class="text-weight-bold q-mt-md">제 18 조 (저작권의 귀속 및 이용 제한)</p>
              <p>1. [앱솔텍]이 작성한 저작물에 대한 저작권 기타 지식재산권은 [앱솔텍]에 귀속합니다.</p>
              <p>2. 회원은 사전 승낙 없이 복제, 송신, 출판 등 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</p>

              <p class="bg-yellow-1 q-pa-sm q-mt-md text-weight-bold text-center border-grey">
                부칙: 이 약관은 2026년 2월 7일부터 시행합니다.
              </p>
            </div>
          </div>
        
        </div>

        <div class="terms-section q-mb-lg">
          <div class="text-subtitle2 text-weight-bold q-mb-xs">
            개인정보 수집 및 이용 동의 <span class="text-primary">(필수)</span>
          </div>
          <div class="terms-scroll-box scroll border-grey q-pa-md bg-grey-1">
            <div class="text-body2 text-grey-9">
              <p>앱솔텍(이하 ‘회사’라 합니다)는 최초 회원 가입 또는 서비스 이용 시 이용자로부터 아래와 같은 개인정보를 수집하고 있습니다.</p>
              
              <q-markup-table flat bordered dense class="q-my-md">
                <thead class="bg-grey-3">
                  <tr>
                    <th class="text-center">수집항목</th>
                    <th class="text-center">수집 목적</th>
                    <th class="text-center">보유 기간</th>
                  </tr>
                </thead>
                <tbody class="text-center q-px-md">
                  <tr>
                    <td>ID, 이름, 휴대폰번호,<br>주소, 이메일</td>
                    <td>로그인 및 회원관리,<br>배송 주소 등 제공</td>
                    <td class="text-weight-bold">탈퇴시 까지</td>
                  </tr>
                </tbody>
              </q-markup-table>

              <p class="q-mb-sm text-caption text-grey-8">
                ※ 귀하께서는 본 개인정보 수집·이용 동의서에 따른 동의 시, '필요한 최소한의 정보 외의 개인정보' 수집·이용에 동의하지 아니할 권리가 있습니다.
              </p>
              <p class="text-caption text-weight-bold">
                ※ 동의를 거부하실 수 있으나, 서비스 제공에 필수적인 정보이므로 거부 시 앱솔텍에서 서비스 및 상품구매를 진행하실 수 없습니다.
              </p>
            </div>
          </div>
         
        </div>

   
      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const agreements = reactive({
  terms: false,
  privacy: false
})

const onSubmit = () => {
  if (isValid.value) {
    alert('모든 약관에 동의하셨습니다. 다음 단계로 진행합니다.')
  }
}
</script>

<style scoped>
.my-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 16px;
  background-color: #ffffff;
}
.custom-shadow {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
}
.terms-scroll-box {
  height: 220px;
  border: 1px solid #ececec;
  border-radius: 8px;
  line-height: 1.6;
}
.border-grey {
  border: 1px solid #e0e0e0;
}
/* 스크롤바 디자인 (웹킷) */
.terms-scroll-box::-webkit-scrollbar {
  width: 6px;
}
.terms-scroll-box::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}
</style>