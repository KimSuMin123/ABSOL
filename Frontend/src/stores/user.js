import { defineStore } from 'pinia';
import axios from 'axios';

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
  async fetchProfile() {
  const token = localStorage.getItem('token');
  
  // 1. 토큰이 없거나 유효하지 않은 문자열이면 중단
  if (!token || token === 'undefined' || token === 'null') {
    console.error("유효한 토큰이 없습니다.");
    return;
  }

  try {
    const response = await axios.get('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/auth/me', {
      headers: {
        // 'Bearer ' 다음에 공백이 있는지 확인
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.success) {
      this.setUser(response.data.data);
    }
  } catch (error) {
    // 401 에러가 나면 로컬의 토큰이 만료된 것이므로 로그아웃 처리
    if (error.response?.status === 401) {
      console.warn("토큰이 만료되었거나 유효하지 않아 로그아웃합니다.");
      this.logout();
      // 필요하다면 여기서 로그인 페이지로 리다이렉트 처리
    }
  }
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