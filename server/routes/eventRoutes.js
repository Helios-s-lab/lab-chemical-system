const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, eventController.getEventList);
router.post('/', authMiddleware, eventController.createEvent);
router.post('/handle', authMiddleware, eventController.handleEvent);

module.exports = router;