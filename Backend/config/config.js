require('dotenv').config(); // .env 파일 로드

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: "database_production",
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false, // 배포 환경에서는 로그를 끄는 것이 일반적입니다.
    }
};