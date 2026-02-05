// routes/sms.js
const express = require('express');
const router = express.Router();
const { SmsAuth } = require('../models');
const { sendSmsV2 } = require('../utils/smsService');

// 1. 인증번호 발송 (회원가입, 비번변경 등 공용)
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    await SmsAuth.destroy({ where: { phone } });
    await SmsAuth.create({ 
      phone, auth_code: otp, 
      expires_at: new Date(Date.now() + 3 * 60000) 
    });
    await sendSmsV2(phone, `[ABSOL TECH] 인증번호 [${otp}]를 입력해주세요.`, 'AUTH');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

// 2. 비회원 견적/결제 링크 전송
router.post('/send-guest-link', async (req, res) => {
  const { phone, pdfUrl, payUrl } = req.body;
  const msg = `[ABSOL] 견적서 확인: ${pdfUrl}\n결제 링크: ${payUrl}`;
  try {
    await sendSmsV2(phone, msg, 'GUEST_LINK');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

// 3. 관리자 알림 (수리/복구 접수 시 내부 호출용)
const notifyAdmin = (detail) => {
  sendSmsV2('01098577531', `[접수알림] ${detail}`, 'ADMIN_NOTI');
};