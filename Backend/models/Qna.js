module.exports = (sequelize, DataTypes) => {
  // 변수에 할당한 후 리턴하거나, 바로 리턴하거나 하나만 해야 합니다.
  const Qna = sequelize.define('Qna', {
    qna_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    author: { type: DataTypes.STRING }, 
    user_id: { type: DataTypes.INTEGER }, 
    
    answer: { type: DataTypes.TEXT },    
    is_answered: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    
    is_private: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    password: { type: DataTypes.STRING } 
  }, {
    tableName: 'Qnas',
    timestamps: true
  });

  return Qna; // 이제 Qna가 정의되었으므로 정상 작동합니다.
};