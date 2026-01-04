module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_name: { type: DataTypes.STRING }, 
    customer_name: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },delivery_company: { 
      type: DataTypes.STRING,
      allowNull: true 
    },
    total_price: { type: DataTypes.INTEGER },
    tracking_number: { type: DataTypes.STRING },
    is_paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    // 진행 상태 컬럼 추가
    status: { 
      type: DataTypes.ENUM('접수완료', '조립중', '조립완료', '상품출고', '배송중', '수령완료'), 
      defaultValue: '접수완료' 
    },toss_order_id: { // 토스 결제창에 보냈던 'ORDER_59gjpra57' 저장용
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },payment_key: { // 결제 승인 후 받는 고유 키 (환불 시 필요)
      type: DataTypes.STRING,
      allowNull: true
    }
  });
};