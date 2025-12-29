const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.post('/register', async (req, res) => {
  try {
    const { login_id, password, customer_name, region, type, productLine ,phone, address} = req.body;

    // 1. 우선 사용자를 생성합니다 (user_id 발급됨)
    const newUser = await User.create({
      login_id,
      password,phone,address,
      customer_name,
      level: 'Basic'
    });

    // 2. 발급된 user_id를 기반으로 고객 번호 조합
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const month = now.getMonth() + 1;
    
    // 분기 계산
    const quarter = Math.ceil(month / 3);

    // user_id를 4자리 문자로 변환 (예: 1 -> 0001)
    const formattedId = String(newUser.user_id).padStart(4, '0');

    // 규칙: YY(2) + 분기(1) + 지역(1) + 유형(1) + 고유ID(4) + 라인(1)
    const customerCode = `${yy}${quarter}${region}${type}${formattedId}${productLine}`;

    // 3. 생성된 번호를 다시 업데이트하여 저장
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

module.exports = router;