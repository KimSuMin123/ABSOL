module.exports = (sequelize, DataTypes) => {
  const Notice = sequelize.define('Notice', {
    notice_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    content: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    author: { 
      type: DataTypes.STRING, 
      defaultValue: '관리자' 
    },
    view_count: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },
    is_fixed: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false,
      comment: '상단 고정 여부'
    }
  }, {
    tableName: 'Notices',
    timestamps: true
  });

  return Notice;
};