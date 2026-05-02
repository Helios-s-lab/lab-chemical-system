const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, labController.getAllLabs);
router.post('/', authMiddleware, labController.createLab);
router.put('/:id', authMiddleware, labController.updateLab);
router.delete('/:id', authMiddleware, labController.deleteLab);

module.exports = router;