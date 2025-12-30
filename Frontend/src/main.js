import { createApp } from 'vue'
import { createPinia } from 'pinia'
// ⚠️ QDialog -> Dialog (플러그인용), QCard, QCardSection, QImg 추가
import { 
  Quasar, 
  Dialog, 
  Notify,
  QLayout, 
  QPageContainer, 
  QPage, 
  QForm, 
  QInput, 
  QSelect, 
  QBtn, 
  QCheckbox, 
  QTable, 
  QRadio, 
  QSeparator, 
  QHeader, 
  QToolbar, 
  QToolbarTitle, 
  QSpace, 
  QBadge, 
  QBtnDropdown, 
  QList, 
  QItem, 
  QItemSection, 
  QFooter, 
  QIcon,
  QDialog,    // 컴포넌트로서의 QDialog
  QCard,      // 다이얼로그 내부 카드
  QCardSection,
  QImg,
  QCarousel,
  QCarouselSlide,
  QCarouselControl     // 상품 이미지용
} from 'quasar'

import router from './router/index' 
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(createPinia())

app.use(Quasar, {
  components: {
    QLayout, QPageContainer, QPage, QForm, QInput, QSelect, QBtn, 
    QCheckbox, QRadio, QTable, QSeparator,
    QHeader, QToolbar, QToolbarTitle, QSpace, QBadge,
    QBtnDropdown, QList, QItem, QItemSection,
    QFooter, QIcon,
    QDialog, QCard, QCardSection, QImg ,QCarousel,
  QCarouselSlide,
  QCarouselControl
  },
  plugins: {
    Dialog,
    Notify
  }
})

app.mount('#app')