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
  const { paymentKey, orderId, amount } = req.body;
  const secretKey = 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6'; // 본인의 시크릿 키로 변경 권장

  const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

  const t = await sequelize.transaction(); // 안전한 처리를 위해 트랜잭션 사용
  try {
    // 1. 토스페이먼츠 API로 승인 요청
    const response = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      { paymentKey, orderId, amount },
      {
        headers: {
          Authorization: `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 2. 승인 성공 시 DB 작업
    // 만약 orderId(ORDER_59gjpra57)가 DB의 order_id와 다르다면, 
    // 모델에 toss_order_id 같은 컬럼을 추가해서 조회해야 합니다.
    // 여기서는 일단 'order_id' 컬럼이 해당 문자열을 받는다고 가정하거나, 
    // 다른 고유 식별자로 매칭해야 합니다.
    
    await Order.update(
      { 
        is_paid: true, 
        status: '접수완료',
        // 만약 모델에 paymentKey 컬럼을 만드셨다면 추가: 
        // tracking_number: paymentKey (또는 별도 컬럼)
      }, 
      { 
        where: { 
          // 만약 orderId가 문자열(ORDER_...)이면 DB의 해당 컬럼과 매칭
          // 예: order_id: orderId (PK가 문자열인 경우) 
          // 혹은 별도의 고유번호 컬럼 사용
          order_id: orderId.replace('ORDER_', '') // 예시: 숫자만 추출할 경우
        },
        transaction: t 
      }
    );

    await t.commit();
    res.status(200).json({ success: true, data: response.data });

  } catch (error) {
    await t.rollback();
    const errorData = error.response?.data || { message: error.message };
    console.error('결제 승인 실패:', errorData);
    res.status(error.response?.status || 500).json(errorData);
  }
});
module.exports = router;