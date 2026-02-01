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

    // 2. 부품 리스트
    const partKeys = [
      'cpu', 'cooler', 'mb', 'ram', 'vga', 'ps', 
      'storage0', 'storage1', 'storage2', 'case', 'etc'
    ];

    // 3. 저장용 객체 구성 및 합계 금액(TotalPrice) 계산 변수
    const saveData = {
      pc_nickname: rawData.pc_nickname || '내 컴퓨터',
      user_id: rawData.user_id || null,
      estimate_id: rawData.estimate_id || null,
      pdf_path: req.file ? req.file.path : null
    };

    let totalPrice = 0;

    // 4. 반복문으로 부품 데이터 매핑 및 합계 계산
    partKeys.forEach(part => {
      const price = Number(rawData[`${part}_price`]) || 0;
      
      saveData[`${part}_name`] = rawData[`${part}_name`] || '';
      saveData[`${part}_sn`] = rawData[`${part}_sn`] || '';
      saveData[`${part}_warranty`] = rawData[`${part}_warranty`] === true;
      saveData[`${part}_price`] = price;
      
      // 실 결제 금액 합산
      totalPrice += price;
    });

    // 5. DB 저장 (Transaction 사용 권장 - 상세정보 저장과 가격 업데이트를 하나로 묶음)
    // 여기서는 간단하게 await를 순차적으로 사용합니다.
    
    // [A] 상세 부품 정보 저장 (EstimateDetail)
    const detailResult = await EstimateDetail.create(saveData);

    // [B] 부모 테이블인 Estimate의 real_price 업데이트
    // rawData.estimate_id가 존재할 경우에만 실행
    if (rawData.estimate_id) {
      await Estimate.update(
        { 
          real_price: String(totalPrice), // 모델 정의가 STRING이므로 문자열로 변환
          status: '견적발송완료' // 필요시 상태값도 함께 변경 가능
        },
        { where: { estimate_id: rawData.estimate_id } }
      );
    }

    res.status(200).json({ 
      success: true, 
      id: detailResult.mypc_id,
      total_calculated_price: totalPrice,
      message: '상세 견적 및 결제 금액이 성공적으로 저장되었습니다.' 
    });

  } catch (error) {
    console.error('❌ DB 저장 상세 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 저장 중 오류 발생',
      error: error.message 
    });
  }
});
// 상세 견적서 정보(PDF 경로 포함) 조회
router.get('/detail/:estimate_id', async (req, res) => {
  try {
    const { estimate_id } = req.params;
    
    // DB에서 해당 견적 ID의 상세 정보를 찾음
    const detail = await EstimateDetail.findOne({
      where: { estimate_id },
      order: [['createdAt', 'DESC']] // 가장 최근에 생성된 것
    });

    if (!detail) {
      return res.status(404).json({ success: false, message: '상세 내역을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: detail // 여기에 pdf_path가 포함되어 내려갑니다.
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// routes/estimate.js
// routes/estimate.js
router.get('/pdf', async (req, res) => {
  try {
    // 1. 모든 데이터를 가져옵니다. (상세 정보 포함)
    const data = await Estimate.findAll({
      include: [{
        model: EstimateDetail,
        as: 'detail',
        attributes: ['pdf_path', 'createdAt'] // 상세 정보의 생성일도 확인
      }],
      order: [['createdAt', 'DESC']] // 일단 전체 최신순 정렬
    });

    // 2. [핵심] estimate_id를 기준으로 중복 제거 (가장 최신 것만 남김)
    const uniqueMap = new Map();

    data.forEach(item => {
      const jsonItem = item.toJSON();
      // Map은 키가 중복되면 덮어쓰지만, 
      // 이미 정렬(DESC)되어 있으므로 처음 만난(가장 최신) ID만 저장하고 나머지는 무시합니다.
      if (!uniqueMap.has(jsonItem.estimate_id)) {
        uniqueMap.set(jsonItem.estimate_id, {
          ...jsonItem,
          pdf_path: jsonItem.detail ? jsonItem.detail.pdf_path : null
        });
      }
    });

    // Map의 값들을 다시 배열로 변환
    const result = Array.from(uniqueMap.values());

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('견적 조회 에러:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;
