module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Repair', {
    repair_id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    customer_name: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    level: { type: DataTypes.STRING },
    symptoms: { type: DataTypes.STRING(200), allowNull: false },
    // 수리 유형 추가
    repair_type: { 
      type: DataTypes.ENUM('수리', '방문수리', '수리불가'), 
      defaultValue: '수리' 
    },
    // 진행 상태 (모든 유형의 단계를 포함하는 ENUM)
    status: { 
      type: DataTypes.ENUM('접수완료', '수리중', '수리완료', '배송중', '수령완료', '센터입고', '수리불가판정', '반송중'), 
      defaultValue: '접수완료' 
    },
    privacy_agreed: { type: DataTypes.ENUM('Y', 'N'), defaultValue: 'Y' }
  }, {
    timestamps: true,
  });
};