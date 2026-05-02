const express = require('express');
const router = express.Router();
const chemicalController = require('../controllers/chemicalController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, chemicalController.getAllChemicals);
router.get('/categories', authMiddleware, chemicalController.getAllCategories);
router.post('/', authMiddleware, chemicalController.createChemical);
router.put('/:id', authMiddleware, chemicalController.updateChemical);
router.delete('/:id', authMiddleware, chemicalController.deleteChemical);

module.exports = router;