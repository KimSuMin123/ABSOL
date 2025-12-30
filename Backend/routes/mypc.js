const express = require('express');
const router = express.Router();
const { MyPC } = require('../models');

// [GET] 특정 고객의 PC 정보 불러오기
router.get('/mypc/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const mypc = await MyPC.findOne({ where: { user_id } });
    res.json({ success: true, data: mypc });
  } catch (error) {
    console.error('MyPC Fetch Error:', error);
    res.status(500).json({ success: false, message: 'PC 정보를 불러오지 못했습니다.' });
  }
});

// [POST] 고객 PC 정보 등록 및 업데이트
router.post('/mypc/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const pcData = req.body;

    // user_id가 누락되지 않았는지 확인
    if (!user_id) {
      return res.status(400).json({ success: false, message: '사용자 ID가 없습니다.' });
    }

    const [mypc, created] = await MyPC.upsert({
      ...pcData,
      user_id: parseInt(user_id) // 숫자로 명확히 변환
    });

    res.json({
      success: true,
      message: created ? '신규 등록 완료' : '정보 수정 완료'
    });
  } catch (error) {
    // 터미널(Node.js 콘솔)에 찍히는 이 에러 내용을 확인해야 합니다.
    console.error('Detailed Error:', error); 
    res.status(500).json({ 
      success: false, 
      message: '저장에 실패했습니다.',
      error: error.message // 프론트엔드 알림창에서 원인을 보기 위함
    });
  }
});

module.exports = router;