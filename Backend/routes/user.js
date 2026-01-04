const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * 1. 회원 전체 조회 / 이름 검색 / 등급 필터 (Admin 전용)
 * GET /api/users?search=이름&level=VIP
 */
router.get('/', async (req, res) => {
  try {
    const { search, level } = req.query;
    let whereClause = {};

    // [이름 검색 로직]
    if (search) {
      whereClause.customer_name = { [Op.like]: `%${search}%` };
    }

    // [등급별 조회 로직]
    if (level && level !== '전체') {
      whereClause.level = level;
    }

    const users = await User.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // 최신 가입순
      attributes: { exclude: ['password'] } // 보안을 위해 비밀번호 제외
    });

    res.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. 회원 등록 
 */
router.post('/register', async (req, res) => {
  try {
    // 1. 프론트엔드 payload 구조와 일치시키기
    // 프론트에서 payload = { ...form.value, full_address: '...' } 로 보냄
    const { 
      login_id, 
      password, 
      customer_name, 
      phone, 
      full_address,  // 프론트에서 합쳐서 보낸 주소
      region,        // 고객코드 생성용 (DB 저장은 안함)
      type,          // 고객코드 생성용
      productLine    // 고객코드 생성용
    } = req.body;

    // 2. 사용자 생성 (모델에 정의된 컬럼만 전달)
    const newUser = await User.create({
      login_id,
      password,
      customer_name,
      phone,
      address: full_address, // DB의 address 컬럼에 합쳐진 주소 저장
      level: 'Basic'
    });

    // 3. 고객 번호 조합 로직
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    
    // 모델 정의에서 user_id를 PK로 정하셨으므로 newUser.user_id가 맞습니다.
    const formattedId = String(newUser.user_id).padStart(4, '0');

    // 규칙: YY(2) + 분기(1) + 지역(1) + 유형(1) + 고유ID(4) + 라인(1)
    // 값이 없을 경우를 대비해 기본값('0') 설정
    const customerCode = `${yy}${quarter}${region || '0'}${type || '0'}${formattedId}${productLine || '0'}`;

    // 4. 생성된 번호 저장
    newUser.customer_code = customerCode;
    await newUser.save();

    res.status(201).json({ 
      success: true, 
      customer_code: customerCode 
    });
  } catch (error) {
    console.error('SERVER ERROR:', error); // 터미널에서 구체적인 에러 확인 가능
    res.status(500).json({ success: false, message: error.message });
  }
});
/**
 * 3. 회원 등급 수정 (Admin용)
 * PATCH /api/users/:id/level
 */
router.patch('/users/:id/level', async (req, res) => {
  try {
    const { level } = req.body;
    // User 모델의 Primary Key 컬럼명이 'id'인지 'user_id'인지 확인 후 수정
    const result = await User.update(
      { level }, 
      { where: { id: req.params.id } } // 또는 user_id: req.params.id
    );
    
    if (result[0] > 0) {
      res.json({ success: true, message: '회원 등급이 변경되었습니다.' });
    } else {
      res.status(404).json({ success: false, message: '유저를 찾지 못했습니다.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 아이디 중복 확인 API
router.get('/check-id/:login_id', async (req, res) => {
  try {
    const { login_id } = req.params;
    
    // DB에서 해당 아이디가 있는지 조회
    const existingUser = await User.findOne({ 
      where: { login_id: login_id } 
    });

    if (existingUser) {
      return res.status(200).json({ isDuplicate: true });
    } else {
      return res.status(200).json({ isDuplicate: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
  }
});
// routes/admin.js (또는 관련 라우터)
router.patch('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { customer_name, phone, address, level, customer_code } = req.body;

    await User.update({
      customer_name,
      phone,
      address,
      level,
      customer_code // 프론트에서 조합해서 보낸 새 코드 저장
    }, { 
      where: { user_id } 
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;