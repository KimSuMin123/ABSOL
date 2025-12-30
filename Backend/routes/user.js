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
    const { login_id, password, customer_name, region, type, productLine, phone, address } = req.body;

    // 1. 사용자 생성
    const newUser = await User.create({
      login_id,
      password,
      phone,
      address,
      customer_name,
      level: 'Basic'
    });

    // 2. 고객 번호 조합 로직
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const formattedId = String(newUser.user_id).padStart(4, '0');

    // 규칙: YY(2) + 분기(1) + 지역(1) + 유형(1) + 고유ID(4) + 라인(1)
    const customerCode = `${yy}${quarter}${region}${type}${formattedId}${productLine}`;

    // 3. 생성된 번호 저장
    newUser.customer_code = customerCode;
    await newUser.save();

    res.status(201).json({ 
      success: true, 
      customer_code: customerCode 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. 회원 등급 수정 (Admin용)
 * PATCH /api/users/:id/level
 */
router.patch('/:id/level', async (req, res) => {
  try {
    const { level } = req.body;
    await User.update({ level }, { where: { user_id: req.params.id } });
    res.json({ success: true, message: '회원 등급이 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;