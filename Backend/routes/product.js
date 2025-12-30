const express = require('express');
const router = express.Router();
const { Product } = require('../models'); 
const { Op } = require('sequelize');

/**
 * 1. 상품 등록 (Admin)
 */
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. 전체 상품 조회 (Admin용 - 재고 0인 상품 포함)
 * 검색 기능 포함 (?search=키워드)
 */
router.get('/admin/all', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause.product_name = { [Op.like]: `%${search}%` };
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. 사용자용 상품 조회 (재고 0 제외)
 * 검색 기능 포함 (?search=키워드)
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    // 기본 조건: 재고가 0보다 큰 상품만
    let whereClause = {
      stock: { [Op.gt]: 0 }
    };

    if (search) {
      whereClause.product_name = { [Op.like]: `%${search}%` };
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 4. 상품 상세 조회 (한 건 조회)
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '상품을 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 5. 상품 정보 수정 (전체 수정)
 */
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, {
      where: { product_id: req.params.id }
    });
    if (!updated) return res.status(404).json({ success: false, message: '상품 없음' });
    
    const updatedProduct = await Product.findByPk(req.params.id);
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 6. 재고 수량만 수정 (Partial Update)
 */
router.patch('/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    await Product.update({ stock }, {
      where: { product_id: req.params.id }
    });
    res.json({ success: true, message: '재고 수량이 업데이트되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 7. 상품 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { product_id: req.params.id }
    });
    if (!deleted) return res.status(404).json({ success: false, message: '상품 없음' });
    res.json({ success: true, message: '상품이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;