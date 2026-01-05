// routes/chatbot.js
const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { Op } = require('sequelize');

router.post('/ask', async (req, res) => {
  const { message } = req.body;

  // 1. 단순 키워드 응답 및 페이지 이동 안내
  if (message.includes('수리')) {
    return res.json({ 
      type: 'nav', 
      content: '🔧 수리 접수가 필요하신가요? 아래 버튼을 눌러 접수 페이지로 이동하세요.',
      path: '/repairs' 
    });
  }
  if (message.includes('견적')) {
    return res.json({ 
      type: 'nav', 
      content: '🖥️ 원하시는 사양으로 견적을 내드려요. 견적 문의 페이지로 이동할까요?',
      path: '/estimate' 
    });
  }
if (message.includes('시간') || message.includes('영업')) {
    return res.json({ 
      type: 'text', 
      content: '🕒 [상담 가능 시간 안내]\n- 평일: 10:00 ~ 19:00\n- 토요일: 10:00 ~ 15:00\n- 일요일 및 공휴일은 휴무입니다.' 
    });
  }

  // [추가] 연락처 안내
  if (message.includes('연락처') || message.includes('번호') || message.includes('전화') ||  message.includes('상담') ) {
    return res.json({ 
      type: 'text', 
      content: '📞 [고객센터 연락처]\n- 대표번호: 010-9857-7531\n 궁금하신 점은 언제든 문의주세요!' 
    });
  }
  // 2. 통합 LIKE 검색 (제품명, 설명, 스펙)
  try {
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { product_name: { [Op.like]: `%${message}%` } },
          { description: { [Op.like]: `%${message}%` } },
          { hardware_info: { [Op.like]: `%${message}%` } }
        ]
      },
      limit: 3 
    });

    if (products.length > 0) {
      return res.json({ type: 'products', content: products });
    } else {
      return res.json({ type: 'text', content: `'${message}'에 대한 검색 결과가 없습니다. 'RTX', '16GB', '사무용' 등 키워드로 물어봐주세요.` });
    }
  } catch (error) {
    res.status(500).json({ error: '검색 중 오류 발생' });
  }
});

module.exports = router;