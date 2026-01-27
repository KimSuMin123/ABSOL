const express = require('express');
const router = express.Router();
const { Qna } = require('../models');

// 1. 전체 질문 목록 조회
router.get('/', async (req, res) => {
  try {
    const qnas = await Qna.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['qna_id', 'title', 'author', 'is_answered', 'is_private', 'createdAt']
    });
    res.json({ success: true, data: qnas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. 질문 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const qna = await Qna.findByPk(req.params.id);
    if (!qna) return res.status(404).json({ success: false, message: '글을 찾을 수 없습니다.' });
    res.json({ success: true, data: qna });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. 질문 등록
router.post('/', async (req, res) => {
  try {
    const newQna = await Qna.create(req.body);
    res.json({ success: true, data: newQna });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. [관리자용] 답변 등록 및 수정
router.patch('/answer/:id', async (req, res) => {
  try {
    const { answer } = req.body;
    await Qna.update(
      { 
        answer: answer, 
        is_answered: !!answer // 답변 내용이 있으면 true, 없으면 false
      },
      { where: { qna_id: req.params.id } }
    );
    res.json({ success: true, message: '답변이 등록되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. 질문 삭제
router.delete('/:id', async (req, res) => {
  try {
    await Qna.destroy({ where: { qna_id: req.params.id } });
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;