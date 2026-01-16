module.exports = (sequelize, DataTypes) => {
  // 1. 공통으로 들어갈 부품 리스트 정의 (프론트엔드와 일치시킴)
  const partKeys = [
    'cpu', 'cooler', 'mb', 'ram', 'vga', 'ps', 
    'storage0', 'storage1', 'storage2', 'case', 'etc'
  ];

  // 2. 기본 컬럼 정의
  const columns = {
    pc_nickname: { 
      type: DataTypes.STRING, 
      defaultValue: '내 컴퓨터' 
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: true,defaultValue: '고객님', 
      comment: '사용자 식별 ID'
    },
    estimate_id: {
      type: DataTypes.INTEGER,
      comment: '연관된 견적서 ID (Estimate 테이블 외래키)',allowNull: true
    },pdf_path: { type: DataTypes.STRING,allowNull: true }
  };

  // 3. 반복문을 통해 부품별 name, sn, warranty, price 컬럼을 자동 생성
  partKeys.forEach((part) => {
    columns[`${part}_name`] = { type: DataTypes.STRING, allowNull: true };
    columns[`${part}_sn`] = { type: DataTypes.STRING, allowNull: true };
    columns[`${part}_warranty`] = { type: DataTypes.BOOLEAN, defaultValue: true };
    columns[`${part}_price`] = { type: DataTypes.INTEGER, defaultValue: 0 }; // 가격 필드 추가
  });

  const EstimateDetail = sequelize.define('EstimateDetail', columns, {
    tableName: 'EstimateDetails',
    timestamps: true, // 생성/수정 시간 기록
    underscored: true, // snake_case 사용 시 설정
  });

  return EstimateDetail;
};