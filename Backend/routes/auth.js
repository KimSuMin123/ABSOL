const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken'); // 토큰 생성용
const bcrypt = require('bcrypt');   // 비번 비교용

const JWT_SECRET = 'your_secret_key'; // 실제 서비스 시 환경변수(.env)에 보관하세요

router.post('/login', async (req, res) => {
  try {
    const { login_id, password } = req.body;

    // 1. 아이디 확인
    const user = await User.findOne({ where: { login_id } });
    if (!user) return res.status(401).json({ success: false, message: '아이디가 존재하지 않습니다.' });

    // 2. 비밀번호 확인 (암호화된 경우 bcrypt.compare 사용)
    // 현재는 단순 비교로 예시를 들지만, 추후 암호화 적용을 권장합니다.
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    // 3. 토큰 발행
    const token = jwt.sign(
      { user_id: user.user_id, login_id: user.login_id, level: user.level },
      JWT_SECRET,
      { expiresIn: '8h' } // 8시간 유지
    );

    res.json({ success: true, token, user: {login_id: user.login_id, name: user.customer_name, level: user.level } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
/**
 * 관리자 로그인 API
 * POST /api/auth/login
 */
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
        login_id: user.login_id,
        name: user.customer_name,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;