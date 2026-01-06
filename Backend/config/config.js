require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306, // 포트 추가
        dialect: process.env.DB_DIALECT || 'mariadb',
        dialectOptions: {
            connectTimeout: 60000 // 연결 대기 시간 60초로 연장
        }
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME, // "database_production" 대신 실제 DB명 사용
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306, // 포트 추가
        dialect: process.env.DB_DIALECT || 'mariadb',
        logging: false,
        dialectOptions: {
            connectTimeout: 60000
        }
    }
};