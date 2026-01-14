const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken'); // 토큰 생성용
const bcrypt = require('bcrypt');   // 비번 비교용

const JWT_SECRET = 'your_secret_key'; // 실제 서비스 시 환경변수(.env)에 보관하세요

router.post('/login', async (req, res) => {
  try {
    const { login_id, password } = req.body;

    // 1. 유저 존재 확인
    const user = await User.findOne({ where: { login_id } });
    if (!user) {
      return res.status(401).json({ success: false, message: '등록되지 않은 아이디입니다.' });
    }

    // 2. 비밀번호 확인
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    // 3. JWT 토큰 생성 (8시간 유효)
    const token = jwt.sign(
      { user_id: user.user_id, login_id: user.login_id, level: user.level },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      user: {
      id: user.user_id,
        login_id: user.login_id,
        name: user.customer_name, // DB의 customer_name을 name으로 매칭
        phone: user.phone,        // 연락처 추가
        address: user.address,    // 주소 추가
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// routes/auth.js

// [추가] 내 정보 가져오기 API (GET /api/auth/me)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // DB에서 전체 정보 조회 (customer_name, phone, address 포함 확인)
    const user = await User.findByPk(decoded.user_id);
    if (!user) return res.status(404).json({ success: false });

    res.json({
      success: true,
      data: {
        id: user.user_id,
        login_id: user.login_id,
        name: user.customer_name,
        phone: user.phone,
        address: user.address,
        level: user.level
      }
    });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});
/**
 * 아이디 찾기
 * POST /api/auth/find-id
 * 입력: customer_name, phone
 */
router.post('/find-id', async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findOne({
      where: {
        customer_name: name,
        // DB 형식이 하이픈이 없다면 purePhone을, 있다면 phone을 사용하세요.
        // 보통은 하이픈 없이 저장하는 것이 일반적입니다.
        phone: phone
      }
    });

    if (user) {
      return res.json({ success: true, login_id: user.login_id });
    } else {
      return res.status(404).json({ success: false, message: '일치하는 정보가 없습니다.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 비밀번호 찾기
 * POST /api/auth/find-pw
 * 입력: customer_name, login_id, phone
 */
router.post('/find-pw', async (req, res) => {
  try {
    const { name, login_id, phone } = req.body;

  

    // 2. DB 조회 (이름, 아이디, 하이픈 제거된 전화번호)
    const user = await User.findOne({
      where: {
        customer_name: name,
        login_id: login_id,
        phone: phone
      }
    });

    if (user) {
      // 3. 일치하는 유저가 있을 경우 비밀번호 반환
      return res.json({ 
        success: true, 
        password: user.password 
      });
    } else {
      // 4. 정보가 하나라도 틀리면 404 에러 반환
      return res.status(404).json({ 
        success: false, 
        message: '입력하신 정보가 일치하지 않습니다.' 
      });
    }
  } catch (error) {
    console.error('Find PW Error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});
module.exports = router;