module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Qna', {
    qna_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    author: { type: DataTypes.STRING }, // 작성자 이름
    user_id: { type: DataTypes.INTEGER }, // 로그인한 유저 ID (연동용)
    
    // 답변 관련
    answer: { type: DataTypes.TEXT },    // 관리자 답변 내용
    is_answered: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    
    // 비밀글 여부
    is_private: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    password: { type: DataTypes.STRING } // 비회원 비밀글용 (선택사항)
  }, {
    tableName: 'Qnas',
    timestamps: true
  });
};