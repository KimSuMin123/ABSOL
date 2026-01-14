<template>
  <q-card class="chatbot-card column" style="max-width: 600px; margin: auto; height: 650px; margin-top: 70px;">
    <q-card-section ref="scrollTarget" class="col overflow-auto scroll">
      <div v-for="(msg, index) in chatHistory" :key="index">
        <q-chat-message
          :name="msg.from === 'me' ? '나' : 'ABSOL'"
          :sent="msg.from === 'me'"
          :bg-color="msg.from === 'me' ? 'amber-2' : 'blue-1'"
        >
          <div 
            v-if="msg.type === 'text' || msg.type === 'nav'"
            style="white-space: pre-line;"
          >
            {{ msg.text }}
            <div v-if="msg.type === 'nav'" class="row justify-center q-mt-sm">
              <q-btn 
                color="primary" 
                label="페이지로 이동" 
                style="width: 80%;"
                @click="$router.push(msg.path)" 
              />
            </div>
          </div>

          <div v-else-if="msg.type === 'products'" class="row q-gutter-sm">
  <q-card 
    v-for="p in msg.products" 
    :key="p.product_id" 
    flat 
    bordered 
    style="width: 150px"
    class="cursor-pointer"
    v-ripple
    @click="goToProductDetail(p.product_id)"
  >
    <q-card-section class="q-pa-xs">
      <div class="text-bold text-blue" style="font-size: 11px">{{ p.product_name }}</div>
      <div class="text-caption">{{ p.product_price.toLocaleString() }}원</div>
      <div class="text-grey-7" style="font-size: 9px">{{ p.hardware_info }}</div>
    </q-card-section>
  </q-card>
</div>
        </q-chat-message>
      </div>
    </q-card-section>

    <q-card-actions>
      <q-input v-model="userInput" @keyup.enter="handleSend" filled dense class="full-width">
        <template v-slot:append>
          <q-btn icon="send" flat @click="handleSend" />
        </template>
      </q-input>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue' // watch와 nextTick 추가
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const userInput = ref('')
const scrollTarget = ref(null) // 스크롤 대상 ref 선언

const chatHistory = ref([{ from: 'bot', type: 'text', text: '안녕하세요!\n부품 검색이나 수리/견적 문의를 도와드릴까요?' }])
const goToProductDetail = (productId) => {
  // 상품 상세 페이지 경로가 /product/123 형태라고 가정합니다.
  // 본인의 라우터 설정에 맞춰 수정하세요.
  router.push(`product/${productId}`) 
}
// 3. 메시지 배열이 바뀔 때마다 스크롤을 아래로 내리는 감시자(watch)
watch(chatHistory, async () => {
  await nextTick() // DOM 업데이트가 완료될 때까지 대기
  if (scrollTarget.value) {
    // 스크롤 대상의 엘리먼트에 직접 접근하여 위치 조정
    const el = scrollTarget.value.$el
    el.scrollTop = el.scrollHeight
  }
}, { deep: true }) // 배열 내부 객체 변화까지 감지

const handleSend = async () => {
  if (!userInput.value.trim()) return
  const message = userInput.value
  chatHistory.value.push({ from: 'me', type: 'text', text: message })
  userInput.value = ''

  try {
    const { data } = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/chatbot/ask', { message })
    
    if (data.type === 'nav') {
      chatHistory.value.push({ from: 'bot', type: 'nav', text: data.content, path: data.path })
    } else if (data.type === 'products') {
      chatHistory.value.push({ from: 'bot', type: 'products', products: data.content })
    } else {
      chatHistory.value.push({ from: 'bot', type: 'text', text: data.content })
    }
  } catch (err) {
    chatHistory.value.push({ from: 'bot', type: 'text', text: '오류가 발생했습니다.\n서버 상태를 확인해주세요.' })
  }
}
</script>

<style scoped>
.chatbot-card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
/* 부드러운 스크롤 효과 추가 */
.scroll {
  scroll-behavior: smooth;
}

.cursor-pointer:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  transition: all 0.2s;
}
</style>