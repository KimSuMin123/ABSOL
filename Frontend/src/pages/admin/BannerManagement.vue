<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h6">배너 관리</div>
      <q-space />
      
      <q-btn 
        color="primary" 
        icon="add" 
        label="배너 사진 추가" 
        @click="onClickUpload" 
        :loading="uploading" 
      />
    </div>

    <input
      type="file"
      ref="fileInput"
      style="display: none"
      accept="image/*"
      @change="onFileChange"
    />

    <q-separator class="q-mb-lg" />

    <div class="row q-col-gutter-md">
      <div v-for="banner in banners" :key="banner.id" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-img :src="`http://svc.sel3.cloudtype.app:30209${banner.url}`" :ratio="16/9">
            <div class="absolute-top-right">
              <q-btn round color="red" icon="delete" size="sm" @click="confirmDelete(banner.id)" />
            </div>
          </q-img>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const banners = ref([])
const fileInput = ref(null) // input 참조
const uploading = ref(false)

const api = axios.create({ baseURL: 'http://svc.sel3.cloudtype.app:30209' })

// [추가하기] 버튼 클릭 시 호출
const onClickUpload = () => {
  // 숨겨진 input 엘리먼트를 직접 클릭함
  fileInput.value.click()
}

// 파일이 선택되었을 때 실행 (링크의 방식)
const onFileChange = async (event) => {
  const file = event.target.files[0] // 선택된 첫 번째 파일
  if (!file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('image', file) // 서버에서 'image'라는 키로 받도록 설정

  try {
    await api.post('/api/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    // 파일 선택 초기화 (같은 파일을 연속으로 올릴 수 있도록)
    event.target.value = '' 
    
    await fetchBanners()
    $q.notify({ color: 'positive', message: '배너 추가 성공' })
  } catch (e) {
    $q.notify({ color: 'negative', message: '업로드 실패' })
  } finally {
    uploading.value = false
  }
}

const fetchBanners = async () => {
  try {
    const res = await api.get('/api/banner')
    banners.value = res.data
  } catch (err) {
    console.error('배너 로드 실패:', err)
  }
}

const confirmDelete = (id) => {
  $q.dialog({
    title: '삭제 확인',
    message: '정말 삭제하시겠습니까?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/api/banner/${id}`)
      fetchBanners()
      $q.notify({ color: 'orange', message: '삭제 완료' })
    } catch (e) {
      $q.notify({ color: 'negative', message: '삭제 실패' })
    }
  })
}

onMounted(fetchBanners)
</script>