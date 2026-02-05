// models/SmsLog.js - 문자 발송 이력 기록용 (모든 시나리오 저장)
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SmsLog', {
    receiver: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    purpose: { 
      type: DataTypes.ENUM('AUTH', 'ADMIN_NOTI', 'GUEST_LINK', 'PAY_DONE'), 
      allowNull: false 
    },
    status: { type: DataTypes.STRING }, // success, fail
    msg_type: { type: DataTypes.STRING }, // SMS, LMS
    request_id: { type: DataTypes.STRING }
  }, { timestamps: true });
};