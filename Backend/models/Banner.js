// Backend/models/banner.js
module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    tableName: 'Banners', // 테이블 이름
    timestamps: true,    // createdAt, updatedAt 자동 생성
  });
  return Banner;
};