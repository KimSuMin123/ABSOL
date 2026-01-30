<template>
  <q-page class="q-pa-md flex justify-center">
    <div style="max-width: 900px; width: 100%;">
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h5 text-weight-bolder text-teal-9">
          <q-icon name="campaign" color="teal" size="md" class="q-mr-sm" />공지사항
        </div>
      </div>

      <q-card flat bordered class="shadow-1">
        <q-list separator>
          <div v-if="loading" class="text-center q-pa-xl">
            <q-spinner-dots color="teal" size="40px" />
          </div>

          <div v-else-if="notices.length === 0" class="text-center q-pa-xl text-grey-6">
            등록된 공지사항이 없습니다.
          </div>

          <template v-else>
            <q-item 
              v-for="item in notices" 
              :key="item.notice_id" 
              clickable 
              v-ripple
              @click="goToDetail(item.notice_id)"
              :class="item.is_fixed ? 'bg-teal-none' : ''"
            >
              <q-item-section side v-if="item.is_fixed">
                <q-badge color="orange" label="중요" />
              </q-item-section>
              
              <q-item-section side v-else class="text-grey-5 text-caption">
                {{ item.notice_id }}
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle1">
                  {{ item.title }}
                </q-item-label>
                <q-item-label caption class="row items-center q-gutter-x-sm">
                  <span>{{ item.author }}</span>
                  <q-separator vertical inset />
                  <span>{{ formatDate(item.createdAt) }}</span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center text-grey-6">
                  <q-icon name="visibility" size="xs" class="q-mr-xs" />
                  <span class="text-caption">{{ item.view_count }}</span>
                </div>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const notices = ref([]);
const loading = ref(true);

const fetchNotices = async () => {
  try {
    const res = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/notices');
    if (res.data.success) {
      notices.value = res.data.data;
    }
  } catch (err) {
    console.error('공지사항 로드 에러:', err);
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id) => {
  router.push(`/notice/${id}`);
};

const formatDate = (date) => date ? date.substring(0, 10) : '';

onMounted(fetchNotices);
</script>