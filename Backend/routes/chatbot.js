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

  const keywords = message
    .replace(/(은|는|이|가|을|를)(\s|$)/g, ' ') // 조사를 공백으로 치환
    .trim()
    .split(/\s+/) // 공백 기준으로 나눠서 배열로 만듦
    .filter(k => k.length > 0); // 빈 문자열 제거

  console.log(`원본 메시지: ${message} -> 추출된 키워드 배열:`, keywords);


// 3. 모든 키워드에 대해 다중 컬럼 검색 쿼리 생성
  // 각 단어가 [상품명, 설명, 스펙] 중 어디라도 걸리면 가져옴
  try {
    const searchConditions = keywords.map(word => ({
      [Op.or]: [
        { product_name: { [Op.like]: `%${word}%` } },
        { description: { [Op.like]: `%${word}%` } },
        { hardware_info: { [Op.like]: `%${word}%` } }
      ]
    }));

    const products = await Product.findAll({
      where: {
        [Op.or]: searchConditions // 생성된 조건들을 다시 OR로 묶음
      },
      limit: 6 // 여러 단어 검색이므로 결과가 많을 수 있어 조금 늘림
    });

    if (products.length > 0) {
      return res.json({ type: 'products', content: products });
    } else {
      const searchAll = keywords.join(', ');
      return res.json({ 
        type: 'text', 
        content: `'${searchAll}' 관련 제품을 찾지 못했습니다.\n다른 단어로 검색해보시겠어요?` 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '검색 중 오류 발생' });
  }
});

module.exports = router;