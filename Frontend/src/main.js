import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { 
  Quasar, 
  Dialog,      // 플러그인
  Notify,      // 플러그인
  Loading,     // 플러그인 (문자열이 아닌 객체로 가져오기)
  QLayout, QPageContainer, QPage, QForm, QInput, QSelect, QBtn, 
  QCheckbox, QTable, QRadio, QSeparator, QHeader, QToolbar, 
  QToolbarTitle, QSpace, QBadge, QBtnDropdown, QList, QItem, 
  QItemSection, QFooter, QIcon, QDialog, QCard, QCardSection, 
  QImg, QCarousel, QCarouselSlide, QCarouselControl, QTooltip, 
  QSpinnerGrid, QInnerLoading, QCardActions, QExpansionItem, QChatMessage,QScrollArea,QDrawer,QMenu,QEditor,
  ClosePopup   // 디렉티브
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
    QCheckbox, QRadio, QTable, QSeparator, QHeader, QToolbar, 
    QToolbarTitle, QSpace, QBadge, QBtnDropdown, QList, QItem, 
    QItemSection, QFooter, QIcon, QDialog, QCard, QCardSection, 
    QImg, QCarousel, QCarouselSlide, QCarouselControl, QTooltip, QDrawer,
    QSpinnerGrid, QInnerLoading, QCardActions, QExpansionItem, QChatMessage,QScrollArea,QMenu,QEditor
  },
  plugins: {
    Dialog,
    Notify,
    Loading  // [수정] 'Loading' 문자열 대신 객체 Loading 직접 등록
  },
  directives: {
    ClosePopup
  },
})

app.mount('#app')