import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    // 로컬스토리지에서 기존 데이터를 불러오거나 빈 배열로 초기화
    items: JSON.parse(localStorage.getItem('cart')) || [],
    
    // [추가] 상세페이지 다이얼로그에서 받은 단일 주문 정보를 임시 보관
    pendingOrder: null 
  }),
  
  getters: {
    // 총 금액 계산 (장바구니용)
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0),
    // 총 아이템 개수 (장바구니용)
    totalCount: (state) => state.items.length
  },
  
  actions: {
    // [추가] 바로 구매 정보 설정 (상품 정보 + 다이얼로그 배송 정보)
    setPendingOrder(orderData) {
      this.pendingOrder = orderData;
    },

    // [추가] 바로 구매 정보 초기화
    clearPendingOrder() {
      this.pendingOrder = null;
    },

    // 장바구니 추가
    addToCart(product) {
      const existingItem = this.items.find(item => item.product_id === product.product_id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
      this.saveToLocalStorage();
    },
    
    // 장바구니 삭제
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.product_id !== productId);
      this.saveToLocalStorage();
    },
    
    // 장바구니 비우기 (결제 성공 시 호출)
    clearCart() {
      this.items = [];
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