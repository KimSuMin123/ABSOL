module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Estimate', {
    estimate_id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    // 회원일 경우를 대비해 user_id 추가 (선택사항이나 권장)
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    customer_name: { 
      type: DataTypes.STRING(20), 
      allowNull: false 
    },
    contact: { 
      type: DataTypes.STRING(20), 
      allowNull: false 
    },
    // 프론트엔드의 상세 주소를 포함한 전체 주소를 저장할 컬럼 추가
    full_address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    // 프론트의 옵션과 맞춤: '영상/그래픽 작업', '서버용' 등 추가 대응을 위해 STRING이나 ENUM 수정
    usage: { 
      type: DataTypes.STRING(50), 
      allowNull: false 
    },
    budget: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    description: { 
      type: DataTypes.STRING(200), 
      allowNull: true 
    },
    privacy_agreed: { 
      type: DataTypes.ENUM('Y', 'N'), 
      allowNull: false,
      defaultValue: 'Y'
    },
    status: {
      type: DataTypes.ENUM('접수완료', '견적발송중', '견적발송완료','배송중', '배송완료'),
      allowNull: false,
      defaultValue: '접수완료'
    },
    tracking_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    delivery_company: { 
      type: DataTypes.STRING, 
      allowNull: true,
      comment: '스마트택배 택배사 코드 (예: 04)'
    },
  }, {
    timestamps: true
  });
};