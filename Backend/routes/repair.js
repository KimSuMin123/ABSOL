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

module.exports = router;