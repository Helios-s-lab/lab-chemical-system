const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, inventoryController.getInventoryList);
router.get('/warning', authMiddleware, inventoryController.getWarningInventory);
router.post('/inbound', authMiddleware, inventoryController.createInboundRecord);

module.exports = router;