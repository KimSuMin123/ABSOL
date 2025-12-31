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
    // 1. req.body에서 user_id를 반드시 받아옵니다.
    const { 
      user_id, // 👈 프론트엔드에서 보낸 user_id 추가
      product_id, 
      customer_name, 
      phone, 
      address, 
      total_price, 
      product_name 
    } = req.body;

    // 2. 재고 확인 및 차감
    const product = await Product.findByPk(product_id, { transaction: t });
    if (!product || product.stock <= 0) {
      throw new Error('재고가 부족하여 주문할 수 없습니다.');
    }
    await product.decrement('stock', { by: 1, transaction: t });

    // 3. 주문 내역 생성 (user_id 포함)
    const newOrder = await Order.create({
      user_id, // 👈 DB에 로그인한 유저 ID가 저장됩니다.
      product_name,
      customer_name,
      phone,
      address,
      total_price,
      is_paid: true,
      status: '접수완료' // 기본 상태값 추가
    }, { transaction: t });

    await t.commit(); // 트랜잭션 확정
    res.status(201).json({ success: true, message: '주문 성공', order_id: newOrder.order_id });
  } catch (error) {
    await t.rollback(); // 오류 시 롤백
    res.status(500).json({ success: false, message: error.message });
  }
}); // 👈 여기서 POST 라우터 닫기

// 운송장 등록 및 상태 수정 (관리자용)
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
// routes/order.js 예시
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const orders = await Order.findAll({
      where: { user_id }, // 주문 저장 시 user_id를 함께 저장했다면 이 방식이 가장 정확합니다.
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;