const express = require('express');
const router = express.Router();const multer = require('multer');
const { Estimate, EstimateDetail } = require('../models');
const fs = require('fs');
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

// 파일 저장 설정 및 폴더 자동 생성
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/estimates/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

// 상세 견적 저장 API
router.post('/save-detail', upload.single('pdfFile'), async (req, res) => {
  try {
    // 1. 데이터 파싱
    const rawData = JSON.parse(req.body.data);

    // 2. 부품 리스트 (모델 컬럼명과 정확히 일치해야 함)
    const partKeys = [
      'cpu', 'cooler', 'mb', 'ram', 'vga', 'ps', 
      'storage0', 'storage1', 'storage2', 'case', 'etc'
    ];

    // 3. 저장용 객체 구성
    const saveData = {
      pc_nickname: rawData.pc_nickname || '내 컴퓨터',
      user_id: rawData.user_id || null,
      estimate_id: rawData.estimate_id || null,
      pdf_path: req.file ? req.file.path : null
    };

    // 4. 반복문으로 부품 데이터 매핑 (rawData에서 정확한 키를 가져오도록 수정)
    partKeys.forEach(part => {
      saveData[`${part}_name`] = rawData[`${part}_name`] || '';
      saveData[`${part}_sn`] = rawData[`${part}_sn`] || '';
      saveData[`${part}_warranty`] = rawData[`${part}_warranty`] === true;
      // 중요: 아까 오타가 있었던 부분입니다. 
      saveData[`${part}_price`] = Number(rawData[`${part}_price`]) || 0;
    });

    // 5. DB 저장
    const result = await EstimateDetail.create(saveData);

    res.status(200).json({ 
      success: true, 
      id: result.mypc_id,
      message: '성공적으로 저장되었습니다.' 
    });

  } catch (error) {
    console.error('❌ DB 저장 상세 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 저장 중 오류 발생',
      error: error.message // 에러 원인을 프론트에 노출하여 확인
    });
  }
});

module.exports = router;

module.exports = router;