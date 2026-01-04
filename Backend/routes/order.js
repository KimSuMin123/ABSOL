const express = require('express');
const router = express.Router();
const { Order, Product, sequelize } = require('../models');
const { Op } = require('sequelize'); // 검색을 위한 연산자 추가
const axios = require('axios');
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
// 바로 구매하기/결제 전 주문 생성: POST /api/orders/direct
router.post('/direct', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      user_id, 
      product_id, 
      customer_name, 
      phone, 
      address, 
      total_price, 
      product_name 
    } = req.body;

    // 1. [해결책] 토스 결제창과 매칭할 유니크한 toss_order_id 생성
    const tossOrderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 2. 재고 확인 (단일 상품인 경우)
    if (product_id) {
      const product = await Product.findByPk(product_id, { transaction: t });
      if (!product || product.stock <= 0) {
        throw new Error('재고가 부족하여 주문할 수 없습니다.');
      }
      // 재고 차감 (결제 성공 시 차감하고 싶다면 confirm으로 옮기셔도 됩니다)
      await product.decrement('stock', { by: 1, transaction: t });
    }

    // 3. [해결책] 모델 정의에 맞춰 필수값 포함하여 주문 생성
    const newOrder = await Order.create({
      user_id: user_id || null,
      product_name,
      customer_name,
      phone,
      address,
      total_price,
      toss_order_id: tossOrderId, // 👈 필수! 이게 없어서 INSERT가 안됐던 것임
      is_paid: false,             // 👈 결제 전이므로 false가 맞음
      status: '접수완료'           // 모델의 ENUM 값 중 하나
    }, { transaction: t });

    await t.commit();
    
    // 4. 생성된 toss_order_id를 프론트로 돌려줌
    res.status(201).json({ 
      success: true, 
      toss_order_id: tossOrderId 
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error('주문 생성 에러:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// [PATCH] 주문 정보 부분 업데이트
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 프론트엔드에서 보낸 필드들만 추출
    const { status, tracking_number, delivery_company, is_paid } = req.body;

    // 업데이트할 객체 동적 생성 (값이 있는 것만 업데이트)
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (delivery_company !== undefined) updateData.delivery_company = delivery_company;
    if (is_paid !== undefined) updateData.is_paid = is_paid;

    // DB 업데이트 실행
    const result = await Order.update(updateData, {
      where: { order_id: id }
    });

    if (result[0] > 0) {
      res.json({ success: true, message: 'DB 업데이트 성공' });
    } else {
      res.status(404).json({ success: false, message: '해당 주문을 찾지 못함' });
    }
  } catch (error) {
    console.error('Update Error:', error);
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
router.post('/confirm', async (req, res) => {
  const { paymentKey, orderId, amount } = req.body; // orderId는 'ORDER_1767514177687' 형태
  const secretKey = 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6'; 
  const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

  const t = await sequelize.transaction();
  try {
    // 1. 토스페이먼츠 최종 승인 요청
    await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      { paymentKey, orderId, amount },
      {
        headers: {
          Authorization: `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 2. [핵심] toss_order_id 컬럼으로 주문을 찾습니다.
    const order = await Order.findOne({ 
      where: { toss_order_id: orderId }, 
      transaction: t 
    });

    if (!order) {
      console.error(`❌ 주문 매칭 실패: toss_order_id가 ${orderId}인 주문이 없습니다.`);
      throw new Error('주문 정보를 찾을 수 없습니다.');
    }

    // 3. 주문 정보 업데이트 (이제 order.order_id를 사용할 수 있습니다)
    await order.update({
      is_paid: true,
      status: '접수완료', // 결제가 완료되었으므로 접수 완료로 변경
      payment_key: paymentKey
    }, { transaction: t });

    await t.commit();
    
    // 응답 시 DB의 진짜 ID(order_id)를 함께 보내주면 프론트에서 관리하기 편합니다.
    res.status(200).json({ 
      success: true, message: '결제 승인 성공',
      db_id: order.order_id 
    });

  } catch (error) {
    if (t) await t.rollback();
    console.error('결제 처리 오류:', error.message);
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;