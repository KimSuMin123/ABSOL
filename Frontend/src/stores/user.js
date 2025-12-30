import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => {
    // 로컬 스토리지에서 'user' 키로 저장된 데이터를 가져옵니다.
    const savedUser = localStorage.getItem('user');
    
    return {
      // 데이터가 있으면 파싱하고, 없으면 기본값을 세팅합니다.
      user: savedUser ? JSON.parse(savedUser) : {
        id: null,
        name: '',
        phone: '',
        address: '',
        plan: 'Basic'
      },
      token: localStorage.getItem('token') || null,
      isLoggedIn: !!localStorage.getItem('token')
    };
  },
  actions: {
    // 로그인 시 데이터를 저장하는 로직도 확인하세요.
    setUser(userData) {
      this.user = { ...this.user, ...userData };
      this.isLoggedIn = true;
      localStorage.setItem('user', JSON.stringify(this.user)); // 로컬 스토리지 동기화
    },
    logout() {
      this.user = { id: null, name: '', phone: '', address: '', plan: 'Basic' };
      this.token = null;
      this.isLoggedIn = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});