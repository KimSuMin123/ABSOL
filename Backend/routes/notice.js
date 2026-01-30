const express = require('express');
const router = express.Router();
const { Notice } = require('../models');

// 1. 공지사항 목록 조회 (상단 고정글 우선, 최신순)
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.findAll({
      order: [
        ['is_fixed', 'DESC'], // 고정글이 위로
        ['createdAt', 'DESC'] // 그다음 최신순
      ],
      attributes: ['notice_id', 'title', 'author', 'is_fixed', 'view_count', 'createdAt']
    });
    res.json({ success: true, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. 공지사항 상세 조회 (조회수 증가 포함)
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: '공지사항을 찾을 수 없습니다.' });

    // 조회수 1 증가
    await notice.increment('view_count');

    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. 공지사항 등록 (관리자용)
router.post('/', async (req, res) => {
  try {
    const newNotice = await Notice.create(req.body);
    res.json({ success: true, data: newNotice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. 공지사항 수정 (관리자용)
router.patch('/:id', async (req, res) => {
  try {
    await Notice.update(req.body, { where: { notice_id: req.params.id } });
    res.json({ success: true, message: '공지사항이 수정되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. 공지사항 삭제 (관리자용)
router.delete('/:id', async (req, res) => {
  try {
    await Notice.destroy({ where: { notice_id: req.params.id } });
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;