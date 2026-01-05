<template>
  <q-card class="chatbot-card column">
    <q-card-section class="col overflow-auto scroll">
      <div v-for="(msg, index) in chatHistory" :key="index">
        <q-chat-message
          :name="msg.from === 'me' ? '나' : 'ABSOL'"
          :sent="msg.from === 'me'"
          :bg-color="msg.from === 'me' ? 'amber-2' : 'blue-1'"
        >
          <div v-if="msg.type === 'text' || msg.type === 'nav'">
            {{ msg.text }}
            <q-btn v-if="msg.type === 'nav'" 
                   color="primary" 
                   label="페이지로 이동" 
                   class="q-mt-sm full-width"
                   @click="$router.push(msg.path)" />
          </div>

          <div v-else-if="msg.type === 'products'" class="row q-gutter-sm">
            <q-card v-for="p in msg.products" :key="p.product_id" flat bordered style="width: 150px">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const userInput = ref('')
const chatHistory = ref([{ from: 'bot', type: 'text', text: '안녕하세요! 부품 검색이나 수리/견적 문의를 도와드릴까요?' }])

const handleSend = async () => {
  if (!userInput.value.trim()) return
  const message = userInput.value
  chatHistory.value.push({ from: 'me', type: 'text', text: message })
  userInput.value = ''

  try {
    const { data } = await axios.post('http://localhost:3000/api/chatbot/ask', { message })
    
    if (data.type === 'nav') {
      chatHistory.value.push({ from: 'bot', type: 'nav', text: data.content, path: data.path })
    } else if (data.type === 'products') {
      chatHistory.value.push({ from: 'bot', type: 'products', products: data.content })
    } else {
      chatHistory.value.push({ from: 'bot', type: 'text', text: data.content })
    }
  } catch (err) {
    chatHistory.value.push({ from: 'bot', type: 'text', text: '오류가 발생했습니다.' })
  }
}
</script>