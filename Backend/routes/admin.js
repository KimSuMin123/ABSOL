const axios = require('axios');
const express = require('express');
const router = express.Router();

// 토스페이먼츠 시크릿 키 (반드시 서버 환경변수에 보관하세요)
const TOSS_SECRET_KEY = 'live_gsk_pP2YxJ4K87PNWQYQ2kOL3RGZwXLO'; // 실제 시크릿 키 입력
const ENCODED_KEY = Buffer.from(TOSS_SECRET_KEY + ':').toString('base64');

// 1. 현금영수증 발급 요청 (POST /api/admin/cash-receipts)
router.post('/cash-receipts', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.tosspayments.com/v1/cash-receipts',
      req.body,
      {
        headers: {
          Authorization: `Basic ${ENCODED_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

// 2. 현금영수증 조회 (GET /api/admin/cash-receipts)
router.get('/cash-receipts', async (req, res) => {
  try {
    const { requestDate, cursor, limit } = req.query;
    const response = await axios.get(
      'https://api.tosspayments.com/v1/cash-receipts',
      {
        params: { requestDate, cursor, limit },
        headers: { Authorization: `Basic ${ENCODED_KEY}` }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

// 3. 현금영수증 취소 (POST /api/admin/cash-receipts/:receiptKey/cancel)
router.post('/cash-receipts/:receiptKey/cancel', async (req, res) => {
  try {
    const { receiptKey } = req.params;
    const response = await axios.post(
      `https://api.tosspayments.com/v1/cash-receipts/${receiptKey}/cancel`,
      req.body, // { amount: ... } 취소 금액이 있으면 포함
      {
        headers: { Authorization: `Basic ${ENCODED_KEY}` }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

module.exports = router;