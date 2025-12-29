const express = require('express');
const router = express.Router();
const { Estimate } = require('../models');

// POST /api/estimates
router.post('/', async (req, res) => {
  try {
    const { customer_name, contact, usage, budget, description,privacy_agreed } = req.body;
    
    const result = await Estimate.create({
      customer_name,
      contact,
      usage,
      budget,
      description,
      privacy_agreed
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;