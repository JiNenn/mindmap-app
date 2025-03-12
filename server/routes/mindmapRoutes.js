// server/routes/mindmapRoutes.js
const express = require('express');
const router = express.Router();
const mindmapController = require('../controllers/mindmapController');
const { verifyToken } = require('../controllers/authController');

// 誰でもマインドマップ一覧を取得できるなら(不要ならコメントアウト)
//router.get('/', mindmapController.getAllMindmaps); 

router.get('/my', verifyToken, mindmapController.getMyMindmaps);

// 作成 (ログイン必須)
router.post('/', verifyToken, mindmapController.createMindmap);

// 詳細表示 (公開リンク用)
router.get('/:id', mindmapController.getMindmapById);

// 更新 (オーナーのみ)
router.put('/:id', verifyToken, mindmapController.updateMindmap);

// 複製
router.post('/:id/clone', verifyToken, mindmapController.cloneMindmap);

// 削除 (オーナーのみ)
router.delete('/:id', verifyToken, mindmapController.deleteMindmap);

router.put('/:id/favorite', verifyToken, mindmapController.updateFavorite);

router.post('/:id/public', verifyToken, mindmapController.generatePublicLink);

// ★ 公開ルート: GET /api/public/:shareId (誰でもOK) 
//   → これは mindmapRoutes とは別に publicRoutes を作る例でもOK
router.get('/public/:shareId', mindmapController.getMapByPublicShareId);

// ★ 公開ルート: 複製
router.post('/public/:shareId/clone', verifyToken, mindmapController.clonePublicMap);

module.exports = router;
