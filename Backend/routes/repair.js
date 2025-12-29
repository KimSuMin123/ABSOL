const express = require('express');
const router = express.Router();
const { Repair } = require('../models');

router.post('/', async (req, res) => {
  try {
    const result = await Repair.create({
      ...req.body
    });
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 모든 수리 목록 가져오기
router.get('/', async (req, res) => {
  try {
    const list = await Repair.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;