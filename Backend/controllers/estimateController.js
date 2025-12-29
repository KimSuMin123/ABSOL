
const { Estimate } = require('../models');

exports.createEstimate = async (req, res) => {
  try {
    const { customer_name, contact, usage, budget, description, privacy_agreed } = req.body;
    
    const newEstimate = await Estimate.create({
      customer_name,
      contact,
      usage,
      budget,
      description,
      privacy_agreed
    });

    res.status(201).json({ success: true, data: newEstimate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};