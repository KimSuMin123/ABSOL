import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, QLayout, QPageContainer, QPage, QForm, QInput, QSelect, QBtn,QCheckbox,QTable,  QRadio,
    QSeparator  } from 'quasar'

// 스타일 가져오기
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(Quasar, {
  components: {
    QLayout,
    QPageContainer,
    QPage,
    QForm,
    QInput,
    QSelect,
    QBtn,
    QCheckbox,QRadio,
    QTable,    // 이게 반드시 있어야 합니다!
    QSeparator // 구분선
  }
})

app.mount('#app')