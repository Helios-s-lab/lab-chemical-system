const pool = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      `SELECT u.user_id, u.username, u.password, u.real_name, u.role_id, r.role_name
       FROM sys_user u
       JOIN role r ON u.role_id = r.role_id
       WHERE u.username = $1 AND u.status = '正常'`,
      [username]
    );

    const rows = result.rows;
    if (rows.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ message: '密码错误' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role_id: user.role_id,
        role_name: user.role_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        real_name: user.real_name,
        role_id: user.role_id,
        role_name: user.role_name
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};