import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 새로고침 시에도 로그인이 유지되도록 로컬스토리지에서 데이터를 읽어옵니다.
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    // 1. 관리자 여부 확인: login_id가 'admin'인 경우 true
    isAdmin: (state) => state.user?.name === '관리자',
    
    // 2. 로그인 여부 확인: 토큰이 존재하면 true
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    /**
     * 로그인 성공 시 호출
     * @param {Object} userData - 서버에서 받은 유저 정보 { login_id, name, level }
     * @param {String} token - 서버에서 받은 JWT 토큰
     */
    login(userData, token) {
      this.user = userData;
      this.token = token;
      
      // 브라우저 저장소에 데이터 보관
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
    },

    /**
     * 로그아웃 시 호출
     */
    logout() {
      this.user = null;
      this.token = null;
      
      // 브라우저 저장소 데이터 삭제
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
});