module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OfflineOrder', {
    offline_order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    customer_name: { type: DataTypes.STRING(20), allowNull: false },
    contact: { type: DataTypes.STRING(20), allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: true },
    
    // 결제 관련
    total_price: { type: DataTypes.INTEGER, allowNull: false },
    pay_method: { 
      type: DataTypes.ENUM('계좌이체', '카드결제', '현금결제', '할부금융'), 
      defaultValue: '계좌이체' 
    },
    payment_status: { 
      type: DataTypes.ENUM('결제대기', '결제완료', '일부입금'), 
      defaultValue: '결제대기' 
    },
    memo: { type: DataTypes.TEXT, allowNull: true },
    pdf_path: { type: DataTypes.STRING, allowNull: true },
    
    status: {
      type: DataTypes.ENUM('주문접수', '조립중', '테스트중', '출고완료', '주문취소'),
      defaultValue: '주문접수'
    }
  }, {
    timestamps: true
  });
};