// models/SmsAuth.js - 인증번호 검증용 (3분 뒤 자동 만료 로직용)
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SmsAuth', {
    phone: { type: DataTypes.STRING, allowNull: false },
    auth_code: { type: DataTypes.STRING(6), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false }
  });
};