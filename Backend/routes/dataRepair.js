const express = require('express');
const router = express.Router();
const { DataRepair } = require('../models'); // 모델명이 DataRepair로 정의되어 있음

// 1. 데이터 복구 신청 등록 (POST /)
router.post('/', async (req, res) => {
  try {
    // req.body에는 customer_name, contact, address, symptoms, level 등이 포함되어야 합니다.
    const result = await DataRepair.create({
      ...req.body
    });
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. 모든 복구 목록 가져오기 (GET /)
router.get('/', async (req, res) => {
  try {
    const list = await DataRepair.findAll({ 
      order: [['createdAt', 'DESC']] 
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. 복구 상태 및 유형 변경 API (PATCH /:id/status)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      repair_type, 
      tracking_number, 
      delivery_company 
    } = req.body;
    
    // DB 업데이트 실행
    const [updated] = await DataRepair.update(
      { 
        status, 
        repair_type, 
        tracking_number, 
        delivery_company 
      }, 
      { where: { repair_id: id } }
    );

    if (updated) {
      res.json({ success: true, message: "상태가 성공적으로 업데이트되었습니다." });
    } else {
      res.status(404).json({ success: false, message: "해당 항목을 찾을 수 없습니다." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. 특정 사용자의 복구 내역 조회 (GET /user/:user_id)
// 주의: 모델 정의에 user_id 컬럼이 없으므로, 필요시 모델에 추가해야 정상 작동합니다.
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const recoveries = await DataRepair.findAll({ 
      where: { user_id }, 
      order: [['createdAt', 'DESC']] 
    });
    res.json({ success: true, data: recoveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;