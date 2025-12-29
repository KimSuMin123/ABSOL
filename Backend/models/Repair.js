module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Repair', {
    repair_id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    customer_name: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false }, // 주소 추가
     level: { type: DataTypes.STRING },
    symptoms: { type: DataTypes.STRING(200), allowNull: false }, // 고장 증상
    privacy_agreed: { type: DataTypes.ENUM('Y', 'N'), defaultValue: 'Y' }
  }, {
    timestamps: true,
  });
};