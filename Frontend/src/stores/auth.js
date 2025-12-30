import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 테스트를 위해 초기값을 설정합니다.
    user: { name: '관리자', role: 'admin' }, 
    token: 'test-token'
  }),
  getters: {
    // 사용자가 있고 role이 admin인지 확인
    isAdmin: (state) => state.user?.role === 'admin',
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    logout() {
      this.user = null;
      this.token = null;
    }
  }
});