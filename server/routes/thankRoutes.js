const express = require('express');
const router = express.Router();
const thankController = require('../controllers/thankController');

// ありがとうカウント取得
router.get('/:mindmapId', thankController.getThankCount);

// ありがとうを加算
router.post('/', thankController.addThank);

module.exports = router;
