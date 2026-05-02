const express = require('express');
const router = express.Router();
const applyController = require('../controllers/applyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, applyController.getApplyList);
router.get('/pending', authMiddleware, applyController.getPendingApply);
router.post('/', authMiddleware, applyController.createApply);
router.post('/approve', authMiddleware, applyController.approveApply);

module.exports = router;