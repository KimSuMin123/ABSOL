import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 새로고침 시에도 로그인이 유지되도록 로컬스토리지에서 데이터를 읽어옵니다.
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loginTime: localStorage.getItem('loginTime') || null, // 로그인 시점 저장
    logoutTimer: null
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
    setAutoLogout(remainingTime) {
      // 기존에 돌아가던 타이머가 있다면 제거
      if (this.logoutTimer) clearTimeout(this.logoutTimer);

      this.logoutTimer = setTimeout(() => {
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        this.logout();
      }, remainingTime);
    },
    login(userData, token) {
      const now = Date.now(); // 현재 시간 (ms)
      const oneHour = 3600 * 500; // 1시간 (ms)

      this.user = userData;
      this.token = token;
      this.loginTime = now;

      // 브라우저 저장소에 데이터 보관
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('loginTime', now.toString());

      this.setAutoLogout(oneHour);
    },

    /**
     * 로그아웃 시 호출
     */
    logout() {
      if (this.logoutTimer) clearTimeout(this.logoutTimer);

      this.user = null;
      this.token = null;
      this.loginTime = null;
      this.logoutTimer = null;
      // 브라우저 저장소 데이터 삭제
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('loginTime');
      router.push('/login');
    },checkAuthTimeout() {
      if (!this.loginTime || !this.token) return;

      const now = Date.now();
      const expirationTime = parseInt(this.loginTime) + (3600 * 1000);
      const remainingTime = expirationTime - now;

      if (remainingTime <= 0) {
        this.logout();
      } else {
        this.setAutoLogout(remainingTime);
      }
    }

  }
});