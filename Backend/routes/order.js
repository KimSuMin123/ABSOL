const express = require('express');
const router = express.Router();
const { Order, Product, sequelize,User } = require('../models');
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
      product_id,    // 바로구매용
      cartItems,     // 장바구니용 (배열)
      customer_name, 
      phone, 
      address, 
      total_price, 
      product_name 
    } = req.body;

    const tossOrderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // --- 재고 차감 로직 ---
    console.log('받은 cartItems 데이터:', JSON.stringify(cartItems, null, 2));
    // 1. 바로구매(단일)일 경우
    if (product_id) {
      const product = await Product.findByPk(product_id, { transaction: t });
      if (!product || product.stock <= 0) throw new Error('재고가 부족합니다.');
      await product.decrement('stock', { by: 1, transaction: t });
    } 
    // 2. 장바구니(여러 상품)일 경우
    
    else if (cartItems && cartItems.length > 0) {
      for (const item of cartItems) {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (!product || product.stock < item.quantity) {
          throw new Error(`[${product?.product_name || '상품'}]의 재고가 부족합니다.`);
        }
        // 각 상품의 수량(quantity)만큼 재고 차감
        await product.decrement('stock', { by: item.quantity, transaction: t });
      }
    }

    // 주문 테이블 생성
    await Order.create({
      user_id: user_id || null,
      product_name,
      customer_name,
      phone,
      address,
      total_price,
      toss_order_id: tossOrderId,
      is_paid: false,
      status: '접수완료'
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ success: true, toss_order_id: tossOrderId });
  } catch (error) {
    if (t) await t.rollback();
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
// routes/orders.js (또는 해당 결제 라우터)
// routes/orders.js (또는 관련 라우터 파일)
// routes/orders.js
router.post('/confirm', async (req, res) => {
  const { paymentKey, orderId, amount, targetLevel } = req.body;
  
  // 1. 토스 시크릿 키 설정 (시크릿 키 뒤에 콜론 ':'을 붙여야 401 에러를 방지합니다)
  const secretKey = 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6'; 
  const authToken = Buffer.from(secretKey + ':').toString('base64');

  try {
    // 2. 토스 승인 요청
    await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      { paymentKey, orderId, amount },
      {
        headers: {
          Authorization: `Basic ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 3. DB 업데이트를 위한 트랜잭션 시작
    const t = await sequelize.transaction();
    try {
      if (orderId.startsWith('MEMBERSHIP')) {
        // orderId 형식: MEMBERSHIP_1_1700000000000 (MEMBERSHIP_유저ID_타임스탬프)
        const userId = orderId.split('_')[1];
        
        // 상단에서 User를 import 했으므로 이제 'User is not defined' 에러가 나지 않습니다.
        const user = await User.findByPk(userId); 
        if (!user) throw new Error('해당 유저를 DB에서 찾을 수 없습니다.');
// [추가] 멤버십 주문 이력을 Order 테이블에 생성
        await Order.create({
          user_id: userId,
          product_name: `${targetLevel} 멤버십 업그레이드`,
          total_price: amount,
          customer_name: user.name || '회원',
          phone: user.phone,
          address: user.address || '멤버십 결제(디지털)',
          toss_order_id: orderId,
          payment_key: paymentKey,
          is_paid: true,
          status: '접수완료'
        }, { transaction: t });
        // 유저 등급 업데이트
        await user.update({ level: targetLevel }, { transaction: t });
      } else {
        // 일반 주문(DIRECT/CART) 처리
        const order = await Order.findOne({ where: { toss_order_id: orderId }, transaction: t });
        if (order) {
          await order.update({ 
            is_paid: true, 
            status: '접수완료', 
            payment_key: paymentKey 
          }, { transaction: t });
        } else {
          throw new Error('주문 내역을 찾을 수 없습니다.');
        }
      }

      await t.commit();
      res.json({ success: true });
    } catch (dbErr) {
      await t.rollback();
      throw dbErr;
    }
  } catch (err) {
    console.error('--- 결제 승인 최종 실패 ---');
    // 토스 API 응답 에러인지, 코드 문법 에러인지 상세히 출력
    console.error(err.response?.data || err.message); 
    
    res.status(500).json({ 
      success: false, 
      message: err.response?.data?.message || err.message 
    });
  }
});

module.exports = router;