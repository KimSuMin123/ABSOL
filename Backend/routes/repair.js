const express = require('express');
const router = express.Router();
const { Repair } = require('../models');

router.post('/', async (req, res) => {
  try {
    const result = await Repair.create({
      ...req.body
    });
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 모든 수리 목록 가져오기
router.get('/', async (req, res) => {
  try {
    const list = await Repair.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 수리 상태 변경 API
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, repair_type, tracking_number } = req.body;
    
    // 유형 변경과 상태 변경을 동시에 처리할 수 있도록 업데이트
    await Repair.update({ status, repair_type, tracking_number }, { where: { repair_id: id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// [추가] 특정 사용자의 수리 내역만 가져오는 라우터
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const repairs = await Repair.findAll({ 
      where: { user_id }, 
      order: [['createdAt', 'DESC']] 
    });
    res.json({ success: true, data: repairs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;