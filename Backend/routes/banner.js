const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// 모델 경로를 프로젝트 구조에 맞게 수정하세요 (예: ../models)
const { Banner } = require('../models'); 

// 1. 저장 위치 및 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/banner/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // 파일명 중복 방지 (시간_원본이름)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 2. [GET] 배너 목록 조회 (이게 없어서 404가 났던 것입니다!)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.findAll({
      order: [['createdAt', 'DESC']] // 최신순 정렬
    });
    res.json(banners);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 3. [POST] 배너 추가
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('파일이 없습니다.');

    const newBanner = await Banner.create({
      url: `/uploads/banner/${req.file.filename}`
    });
    res.json(newBanner);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 4. [DELETE] 배너 삭제
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).send('대상을 찾을 수 없습니다.');

    // 실제 파일 삭제 경로 계산
    // banner.url이 '/uploads/banner/...' 형태라면 public/static 설정에 따라 경로 조절 필요
    const filePath = path.join(__dirname, '..', banner.url);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
    }
    
    await banner.destroy(); 
    res.send('Deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;