const express = require('express');
const router = express.Router();
const { Product } = require('../models'); 
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// [중요] 업로드 폴더 자동 생성 로직
const uploadDir = 'uploads/products/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    // 파일명 중복 방지: 현재시간_원본이름
    cb(null, Date.now() + '_' + file.originalname);
  }
});

// [에러 해결 포인트] upload 변수를 정의해야 합니다!
const upload = multer({ storage: storage });

/**
 * 1. 상품 등록 (Admin) - 이미지 업로드 포함
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // FormData로 들어오는 boolean/number 타입 보정
    if (productData.is_used !== undefined) {
      productData.is_used = productData.is_used === 'true' || productData.is_used === true;
    }

    if (req.file) {
      // DB에는 접근 가능한 경로 저장
      productData.image_url = `/uploads/products/${req.file.filename}`;
    }
    
    const product = await Product.create(productData);
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 2. 전체 상품 조회 (Admin용)
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
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = { stock: { [Op.gt]: 0 } };
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
 * 4. 상품 상세 조회
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: '상품 없음' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 5. 상품 정보 수정 (Admin) - 이미지 수정 기능 추가
 */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const productData = { ...req.body };

    // FormData 타입 보정
    if (productData.is_used !== undefined) {
      productData.is_used = productData.is_used === 'true' || productData.is_used === true;
    }

    // 새로운 이미지가 업로드된 경우 경로 업데이트
    if (req.file) {
      productData.image_url = `/uploads/products/${req.file.filename}`;
    }

    const [updated] = await Product.update(productData, {
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
 * 6. 재고 수량만 수정
 */
router.patch('/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    await Product.update({ stock }, {
      where: { product_id: req.params.id }
    });
    res.json({ success: true, message: '업데이트 완료' });
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
    res.json({ success: true, message: '삭제 완료' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;