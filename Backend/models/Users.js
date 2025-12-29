module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    customer_name: { type: DataTypes.STRING, allowNull: false }, // 성함 추가
    address: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    customer_code: { type: DataTypes.STRING, unique: true }, // 생성된 고객 번호 저장
    level: { 
      type: DataTypes.ENUM('Basic', 'Standard', 'Green', 'Silver', 'Gold'), 
      defaultValue: 'Basic' 
    }
  });
};