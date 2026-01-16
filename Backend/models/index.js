const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env]; // DB 설정 정보
const db = {};


// models/index.js 예시
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// 2. 각 모델 파일을 불러와서 db 객체에 담기
// (각 파일에서 module.exports = (sequelize, DataTypes) => { ... } 로 정의했을 때)
db.User = require('./Users')(sequelize, Sequelize);
db.Product = require('./Product')(sequelize, Sequelize);
db.Estimate = require('./Estimate')(sequelize, Sequelize);
db.EstimateDetail = require('./EstimateDetail')(sequelize, Sequelize);
db.Repair = require('./Repair')(sequelize, Sequelize);
db.Order = require('./Order')(sequelize, Sequelize);
db.CompanyInfo = require('./CompanyInfo')(sequelize, Sequelize);
db.MyPC = require('./MyPC')(sequelize, Sequelize);
db.Banner = require('./Banner')(sequelize, Sequelize);
db.DataRepair = require('./DataRepair')(sequelize, Sequelize);

// 3. 관계 정의 (작성하신 코드 적용)
// 회원 <-> 견적, 수리, 주문
db.User.hasMany(db.Estimate, { foreignKey: 'user_id', sourceKey: 'user_id' });
db.Estimate.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });

db.User.hasMany(db.Repair, { foreignKey: 'user_id', sourceKey: 'user_id' });
db.Repair.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });

db.User.hasMany(db.Order, { foreignKey: 'user_id', sourceKey: 'user_id' });
db.Order.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });

// 상품 <-> 주문
db.Product.hasMany(db.Order, { foreignKey: 'product_id', sourceKey: 'product_id' });
db.Order.belongsTo(db.Product, { foreignKey: 'product_id', targetKey: 'product_id' });

// 회원 <-> 내 PC (1:N 관계)
db.User.hasMany(db.MyPC, { foreignKey: 'user_id', sourceKey: 'user_id' });
db.MyPC.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'user_id' });

// 4. 외부에서 쓸 수 있게 내보내기
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;