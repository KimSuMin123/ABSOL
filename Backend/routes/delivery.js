const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/track', async (req, res) => {
  try {
    const { t_code, t_invoice } = req.query;
    const API_KEY = 'lvhHr8UbL1MCUIrhuQUlMg'; 

    // 숫자만 추출
    const cleanInvoice = String(t_invoice).replace(/[^0-9]/g, '');

    // 1. 요청 전 로그 확인 (서버 터미널 확인용)
    console.log(`운송장 조회 요청: 업체코드(${t_code}), 송장번호(${cleanInvoice})`);

    const response = await axios.get('https://info.sweettracker.co.kr/api/v1/trackingInfo', {
      params: {
        t_key: API_KEY,
        t_code: t_code,
        t_invoice: cleanInvoice
      }
    });

    // 2. 스마트택배 응답 결과 분석
    const result = response.data;
    
    // API는 성공했지만 데이터가 없는 경우 (status가 false이거나 msg가 포함된 경우)
    if (result.status === false || result.result === 'N') {
      return res.status(400).json({ 
        success: false, 
        message: result.msg || '해당 번호로 조회된 배송 정보가 없습니다.' 
      });
    }

    res.json({ success: true, data: result });

  } catch (error) {
    // 3. 실제 에러 상세 로그 출력 (이 부분이 가장 중요합니다)
    console.error('SweetTracker API 상세 에러:', error.response ? error.response.data : error.message);
    
    res.status(500).json({ 
      success: false, 
      message: '배송 조회 API 통신 중 오류가 발생했습니다.',
      debug: error.message // 개발 단계에서만 확인용
    });
  }
});
// backend/routes/delivery.js 에 추가
router.get('/companyList', async (req, res) => {
  try {
    const API_KEY = 'lvhHr8UbL1MCUIrhuQUlMg';
    const response = await axios.get(`https://info.sweettracker.co.kr/api/v1/companylist?t_key=${API_KEY}`);
    res.json(response.data); // { Company: [{ Code: "04", Name: "CJ대한통운" }, ...] }
  } catch (error) {
    res.status(500).json({ message: '택배사 목록 로드 실패' });
  }
});
module.exports = router;