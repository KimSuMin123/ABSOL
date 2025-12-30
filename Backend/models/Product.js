module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    product_id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    image_url: { type: DataTypes.STRING },
    product_name: { type: DataTypes.STRING, allowNull: false },
    product_price: { type: DataTypes.INTEGER, allowNull: false },
    stock: { 
      type: DataTypes.INTEGER, 
      allowNull: false
    },
    is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
    description: { type: DataTypes.TEXT },
    hardware_info: { type: DataTypes.TEXT } 
  }, {
    tableName: 'Products',
    timestamps: true
  });
};