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

// routes/chatbot.js 수정 부분

const rawKeywords = message
  .replace(/(은|는|이|가|을|를|이요|있나요|있어|있니|해줘|알려줘|주세요)(\s|$)/g, ' ') 
  .trim()
  .split(/\s+/);

// [추가] 검색에서 제외할 단어들 (불용어 리스트)
const stopWords = ['추천', '검색', '찾아', '상품', '제품', '가격', '얼마'];

const keywords = rawKeywords
  .filter(k => k.length > 0 && !stopWords.includes(k)); // 불용어 제외

console.log(`최종 추출된 키워드:`, keywords);
  if (keywords.length === 0) {
    return res.json({ type: 'text', content: '어떤 제품을 찾으시나요? 키워드를 입력해주세요!' });
  }

  try {
    const andConditions = keywords.map(word => ({
      [Op.or]: [
        { product_name: { [Op.like]: `%${word}%` } },
        { description: { [Op.like]: `%${word}%` } },
        { hardware_info: { [Op.like]: `%${word}%` } }
      ]
    }));

    let products = await Product.findAll({
      where: { [Op.and]: andConditions }, // 모든 키워드가 만족해야 함
      limit: 6
    });

    // 2. [OR 조건] AND 결과가 없을 경우 각각의 키워드로 검색
    if (products.length === 0 && keywords.length > 1) {
      console.log('AND 검색 결과 없음 -> OR 검색으로 전환');
      products = await Product.findAll({
        where: { [Op.or]: andConditions }, // 키워드 중 하나라도 포함되면 됨
        limit: 6
      });
    }

    // 3. 응답 처리
    if (products.length > 0) {
      return res.json({ 
        type: 'products', 
        content: products,
        message: products.length === keywords.length ? '정확한 검색 결과입니다.' : '관련 상품들을 추천해 드려요!'
      });
    } else {
      const searchAll = keywords.join(', ');
      return res.json({ 
        type: 'text', 
        content: `'${searchAll}' 관련 제품을 찾지 못했습니다.\n단어를 줄여서 검색해 보시겠어요?` 
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '검색 중 오류 발생' });
  }
});

module.exports = router;