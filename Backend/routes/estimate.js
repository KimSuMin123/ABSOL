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
    // 프론트엔드에서 보내는 추가 배송 정보들을 함께 받습니다.
    const { status, tracking_number, delivery_company } = req.body;

    // 업데이트할 필드들을 객체로 구성
    const updateData = {
      status,
      tracking_number: tracking_number || null,
      delivery_company: delivery_company || null
    };

    const [updated] = await Estimate.update(updateData, { 
      where: { estimate_id: id } 
    });

    if (updated) {
      res.json({ success: true, message: '견적 상태 및 배송 정보가 변경되었습니다.' });
    } else {
      res.status(404).json({ success: false, message: '해당 내역을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('상태 업데이트 에러:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// 2. [GET] 특정 사용자의 견적 내역 가져오기 (마이페이지용)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const list = await Estimate.findAll({ 
      where: { user_id: userId },
      order: [['createdAt', 'DESC']] 
    });
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('사용자별 견적 조회 에러:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;