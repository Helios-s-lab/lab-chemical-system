const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// 获取用户列表
router.get('/', authMiddleware, userController.getAllUsers);

// 新增用户
router.post('/', authMiddleware, userController.createUser);

// 修改用户
router.put('/:id', authMiddleware, userController.updateUser);

// 删除用户
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
