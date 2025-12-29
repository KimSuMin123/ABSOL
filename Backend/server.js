const express = require('express');
const { sequelize } = require('./models'); // models/index.js를 불러옴
const app = express();

// DB 연결 및 테이블 생성
// force: true로 설정하면 기존 테이블을 삭제하고 새로 만듭니다. (초기 설계 시 유용)
// force: false는 기존 테이블이 있으면 건드리지 않습니다.
sequelize.sync({ force: false }) 
  .then(() => {
    console.log('✅ 데이터베이스 연결 성공 및 테이블 생성 완료!');
  })
  .catch((err) => {
    console.error('❌ DB 연결 에러:', err);
  });

app.listen(3000, () => {
  console.log('🚀 서버가 3000번 포트에서 돌아가고 있습니다.');
});