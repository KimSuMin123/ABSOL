module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_name: { type: DataTypes.STRING }, // 주문 당시 상품명 백업
    customer_name: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    total_price: { type: DataTypes.INTEGER },
    tracking_number: { type: DataTypes.STRING },
    is_paid: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
  return Order;
};