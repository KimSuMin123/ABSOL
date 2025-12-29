module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Estimate', {
    estimate_id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    customer_name: { 
      type: DataTypes.STRING(20), 
      allowNull: false // 성함
    },
    contact: { 
      type: DataTypes.STRING(20), 
      allowNull: false // 연락처
    },
    usage: { 
      type: DataTypes.ENUM('사무용', '게임용', '기타 고사양 작업'), 
      allowNull: false // 카테고리 선택
    },
    budget: { 
      type: DataTypes.INTEGER, 
      allowNull: false // 예산 (숫자)
    },
    description: { 
      type: DataTypes.STRING(200), 
      allowNull: true // 200자 자유 입력
    },
    privacy_agreed: { 
      type: DataTypes.ENUM('Y', 'N'), 
      allowNull: false
    }
  }, {
    timestamps: true
  });
};