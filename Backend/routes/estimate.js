const express = require('express');
const router = express.Router();
const { Estimate } = require('../models');

// POST /api/estimates
router.post('/', async (req, res) => {
  try {
    // 1. req.body에서 full_address를 반드시 포함해서 구조분해 할당해야 합니다.
    const { customer_name, contact, usage, budget, description, privacy_agreed, full_address, user_id } = req.body;
    
    // 2. DB에 생성
    const result = await Estimate.create({
      user_id: user_id || null, // 회원번호가 있으면 저장
      customer_name,
      contact,
      usage,
      budget,
      description,
      privacy_agreed,
      full_address, // 이제 위에서 정의했으므로 에러가 나지 않습니다.
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('견적 저장 에러:', error);
    // 상세 에러 메시지를 보내주면 디버깅이 더 쉽습니다.
    res.status(500).json({ success: false, message: error.message || '서버 오류' });
  }
});

// 모든 견적 목록 가져오기
router.get('/', async (req, res) => {
  try {
    const list = await Estimate.findAll({ order: [['createdAt', 'DESC']] }); // 최신순
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await Estimate.update({ status }, { where: { estimate_id: id } });
    res.json({ success: true, message: '상태가 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;