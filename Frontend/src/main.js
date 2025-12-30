import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, QLayout, QPageContainer, QPage, QForm, QInput, QSelect, QBtn, QCheckbox, QTable, QRadio, QSeparator, QHeader, QToolbar, QToolbarTitle, QSpace, QBadge, QBtnDropdown, QList, QItem, QItemSection, QFooter, QIcon } from 'quasar'

// 1. 라우터 가져오기 (파일 경로를 확인하세요)
import router from './router/index' 

// 스타일 가져오기
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'

const app = createApp(App)

// 2. 라우터 등록 (이 줄이 반드시 필요합니다!)
app.use(router)

app.use(createPinia())

// Quasar 설정 (사용한 모든 컴포넌트를 등록해야 빨간 줄이 안 생깁니다)
app.use(Quasar, {
  components: {
    QLayout, QPageContainer, QPage, QForm, QInput, QSelect, QBtn, 
    QCheckbox, QRadio, QTable, QSeparator,
    QHeader, QToolbar, QToolbarTitle, QSpace, QBadge, // 헤더용 추가
    QBtnDropdown, QList, QItem, QItemSection,        // 메뉴용 추가
    QFooter, QIcon                                   // 푸터 및 아이콘 추가
  }
})

app.mount('#app')