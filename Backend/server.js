const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models'); // Sequelize 인스턴스 가져오기
const path = require('path');

// 라우터 가져오기
const estimateRouter = require('./routes/estimate');
const repairRouter = require('./routes/repair');
const userRouter = require('./routes/user');
const productRouter = require('./routes/product')
const orderRouter = require('./routes/order');

// 환경변수 설정
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // 프런트엔드와 통신 허용
app.use(express.json()); // JSON 데이터 파싱
app.use(express.urlencoded({ extended: true }));

// 기본 경로 테스트
app.get('/', (req, res) => {
  res.send('🚀 서버가 정상 작동 중입니다.');
});

// API 라우트 연결
// 이 부분이 있어야 프런트엔드에서 /api/estimates 로 요청을 보낼 수 있습니다.
app.use('/api/estimates', estimateRouter);
app.use('/api/repairs', repairRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 데이터베이스 연결 및 서버 실행
sequelize.sync({ force: true }) // force: false는 기존 테이블을 삭제하지 않고 유지함
  .then(() => {
    console.log('✅ 데이터베이스 연결 성공 및 테이블 동기화 완료!');
    
    app.listen(PORT, () => {
      console.log(`🚀 서버가 ${PORT}번 포트에서 돌아가고 있습니다.`);
    });
  })
  .catch((err) => {
    console.error('❌ 데이터베이스 연결 실패:', err);
  });