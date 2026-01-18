const express = require('express');
const router = express.Router();
// 모델 파일 위치를 확인하세요 (대문자/소문자 주의)
const { Order, Repair, Estimate } = require('../models'); 
const { Op } = require('sequelize');

router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. 오늘의 매출액 계산 (is_paid가 true인 오늘 주문 합계)
    // .sum() 사용 시 데이터가 없으면 null을 반환하므로 || 0 처리가 필수입니다.
    const todayRevenue = await Order.sum('total_price', {
      where: {
        createdAt: { [Op.gte]: today },
        is_paid: true
      }
    }) || 0;

    // 2. 미처리 목록 (접수완료 상태) 병렬 조회
    const [newOrders, newRepairs, newEstimates] = await Promise.all([
      Order.findAll({ 
        where: { status: '접수완료' ,product_name: {
        [Op.notLike]: '%멤버십 업그레이드%'
      }}, 
        order: [['createdAt', 'DESC']],
        limit: 5 // 대시보드 성능을 위해 최근 5건만
      }),
      Repair.findAll({ 
        where: { status: '접수완료' }, 
        order: [['createdAt', 'DESC']] 
      }),
      Estimate.findAll({ 
        where: { status: '접수완료' }, 
        order: [['createdAt', 'DESC']] 
      })
    ]);

    // 3. 정상 응답
    res.json({
      success: true,
      stats: {
        todayRevenue,
        newOrderCount: newOrders.length,
        newRepairCount: newRepairs.length,
        newEstimateCount: newEstimates.length
      },
      lists: {
        newOrders,
        newRepairs,
        newEstimates
      }
    });

  } catch (err) {
    // 500 에러 발생 시 백엔드 터미널에 에러 로그를 남깁니다.
    console.error("--- Dashboard API Error ---");
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: "서버 내부 오류: " + err.message 
    });
  }
});

module.exports = router;