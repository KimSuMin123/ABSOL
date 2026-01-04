import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => {
    const savedUser = localStorage.getItem('user');
    let parsedUser = null;

    // [해결책] 데이터가 있고, 문자열 "undefined"가 아닐 때만 파싱 시도
    try {
      if (savedUser && savedUser !== "undefined") {
        parsedUser = JSON.parse(savedUser);
      }
    } catch (e) {
      console.error("로컬스토리지 파싱 에러:", e);
      localStorage.removeItem('user'); // 망가진 데이터는 삭제
    }
    
    return {
      // 파싱된 데이터가 있으면 사용하고, 없으면 기본값 세팅
      user: parsedUser || {
        id: null,
        name: '',
        phone: '',
        address: '',
        level: 'Basic' // plan에서 level로 통일
      },
      token: localStorage.getItem('token') || null,
      isLoggedIn: !!localStorage.getItem('token')
    };
  },
  actions: {
    setUser(userData) {
      // 기존 유저 정보에 새로운 정보를 덮어씌움
      this.user = { ...this.user, ...userData };
      this.isLoggedIn = true;
      // 로컬 스토리지 동기화
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    logout() {
      this.user = { id: null, name: '', phone: '', address: '', level: 'Basic' };
      this.token = null;
      this.isLoggedIn = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});