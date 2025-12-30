import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    // 로컬스토리지에서 기존 데이터를 불러오거나 빈 배열로 초기화
    items: JSON.parse(localStorage.getItem('cart')) || []
  }),
  
  getters: {
    // 총 금액 계산
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0),
    // 총 아이템 개수
    totalCount: (state) => state.items.length
  },
  
  actions: {
    // 장바구니 추가
    addToCart(product) {
      const existingItem = this.items.find(item => item.product_id === product.product_id);
      
      if (existingItem) {
        existingItem.quantity += 1; // 이미 있으면 수량만 증가
      } else {
        this.items.push({ ...product, quantity: 1 }); // 없으면 새로 추가
      }
      this.saveToLocalStorage();
    },
    
    // 장바구니 삭제
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.product_id !== productId);
      this.saveToLocalStorage();
    },
    
    // 수량 변경
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.product_id === productId);
      if (item && quantity > 0) {
        item.quantity = quantity;
        this.saveToLocalStorage();
      }
    },
    
    // 로컬스토리지 저장
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    }
  }
});