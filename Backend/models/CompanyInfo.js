module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CompanyInfo', {
    representative: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING }
  }, { timestamps: false });
};