module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Estimate', {
    estimate_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_name: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: false },
    usage: { type: DataTypes.STRING },
    budget: { type: DataTypes.INTEGER },
    privacy_agreement: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
};