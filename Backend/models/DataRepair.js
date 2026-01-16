module.exports = (sequelize, DataTypes) => {
  return sequelize.define('DataRepair', {
    user_id:{
type: DataTypes.STRING, allowNull:true
    },
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
    // 복구 유형 추가
    repair_type: { 
      type: DataTypes.ENUM('복구', '방문복구', '복구불가'), 
      defaultValue: '복구' 
    },
    // 진행 상태 (모든 유형의 단계를 포함하는 ENUM)
    status: { 
      type: DataTypes.ENUM('접수완료', '복구중', '복구완료', '배송중', '수령완료', '센터입고', '복구불가판정', '반송중'), 
      defaultValue: '접수완료' 
    },tracking_number: { 
  type: DataTypes.STRING, 
  allowNull: true 
},delivery_company: { 
  type: DataTypes.STRING, 
  allowNull: true,
  comment: '스마트택배 택배사 코드 (예: 04)'
},
    privacy_agreed: { type: DataTypes.ENUM('Y', 'N'), defaultValue: 'Y' }
  }, {
    timestamps: true,
  });
};