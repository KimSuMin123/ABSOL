module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Repair', {
    repair_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_name: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING },
    level: { type: DataTypes.STRING }, // 접수 시점의 등급 기록
    symptoms: { type: DataTypes.TEXT },
    privacy_agreement: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
};