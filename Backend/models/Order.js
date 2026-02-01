module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_name: { type: DataTypes.STRING }, 
    customer_name: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    delivery_company: { type: DataTypes.STRING, allowNull: true },
    total_price: { type: DataTypes.INTEGER },
    tracking_number: { type: DataTypes.STRING },
    // BOOLEAN은 0/1을 false/true로 자동 변환합니다.
    is_paid: { type: DataTypes.BOOLEAN, defaultValue: 0 },
    status: { 
      type: DataTypes.ENUM('접수완료', '조립중', '조립완료', '상품출고', '배송중', '수령완료', '결제완료'), // '결제완료' 추가
      defaultValue: '접수완료' 
    },
    toss_order_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    payment_key: { type: DataTypes.STRING, allowNull: true },
    // ★ pdf_path 컬럼 추가 ★
    pdf_path: { type: DataTypes.STRING, allowNull: true },
    // ★ product_ids 컬럼 추가 (문자열 저장용) ★
    product_ids: { type: DataTypes.TEXT, allowNull: true }
  });
};