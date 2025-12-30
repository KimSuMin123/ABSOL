const express = require('express');
const router = express.Router();
const { Order, Product, sequelize } = require('../models');
const { Op } = require('sequelize'); // 검색을 위한 연산자 추가
/**
 * 1. 주문 이력 전체 조회 및 검색 (고객명, 연락처, 상품명)
 * GET /api/orders
 */
router.get('/', async (req, res) => {
  try {
    const { search, is_paid } = req.query;
    let whereClause = {};

    // 검색어가 있는 경우 (고객명, 연락처, 상품명에서 통합 검색)
    if (search) {
      whereClause = {
        [Op.or]: [
          { customer_name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { product_name: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    // 결제 상태 필터링 추가
    if (is_paid !== undefined) {
      whereClause.is_paid = is_paid === 'true';
    }

    const orders = await Order.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']] // 최신순 정렬
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. 특정 고객별 주문 이력 조회
 * GET /api/orders/customer/:phone
 */
router.get('/customer/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const orders = await Order.findAll({
      where: { phone: phone }, // 고유한 전화번호를 기준으로 조회
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// 바로 구매하기: POST /api/orders/direct
router.post('/direct', async (req, res) => {
  const t = await sequelize.transaction(); // 트랜잭션 시작
  try {
    const { product_id, customer_name, phone, address, total_price, product_name } = req.body;

    // 1. 재고 확인 및 차감
    const product = await Product.findByPk(product_id, { transaction: t });
    if (!product || product.stock <= 0) {
      throw new Error('재고가 부족하여 주문할 수 없습니다.');
    }
    await product.decrement('stock', { by: 1, transaction: t });

    // 2. 주문 내역 생성
    const newOrder = await Order.create({
      product_name,
      customer_name,
      phone,
      address,
      total_price,
      is_paid: true
    }, { transaction: t });

    await t.commit(); // 확정
    res.status(201).json({ success: true, message: '주문 성공', order_id: newOrder.order_id });
  } catch (error) {
    await t.rollback(); // 취소
    res.status(500).json({ success: false, message: error.message });
  }
  // 3. 운송장 등록 및 직접 배송 처리 (PATCH)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number, status } = req.body;
    
    const updateData = {};
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (status !== undefined) updateData.status = status;

    await Order.update(updateData, { where: { order_id: id } });
    res.json({ success: true, message: '주문 정보 업데이트 완료' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
});

module.exports = router;