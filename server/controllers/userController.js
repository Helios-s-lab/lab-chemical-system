const pool = require('../config/db');

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.real_name,
        u.gender,
        u.phone,
        u.email,
        u.status,
        u.create_time,
        r.role_name,
        l.lab_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      LEFT JOIN laboratory l ON u.lab_id = l.lab_id
      ORDER BY u.user_id DESC
    `);

    res.json({
      message: '获取用户列表成功',
      data: rows
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      message: '获取用户列表失败',
      error: error.message
    });
  }
};

// 新增用户
exports.createUser = async (req, res) => {
  try {
    const {
      username,
      password,
      real_name,
      gender,
      phone,
      email,
      role_id,
      lab_id,
      status
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO user
      (username, password, real_name, gender, phone, email, role_id, lab_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        password,
        real_name,
        gender,
        phone,
        email,
        role_id,
        lab_id || null,
        status || '正常'
      ]
    );

    res.json({
      message: '新增用户成功',
      user_id: result.insertId
    });
  } catch (error) {
    console.error('新增用户失败:', error);
    res.status(500).json({
      message: '新增用户失败',
      error: error.message
    });
  }
};

// 修改用户
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      real_name,
      gender,
      phone,
      email,
      role_id,
      lab_id,
      status
    } = req.body;

    await pool.query(
      `UPDATE user
       SET real_name = ?, gender = ?, phone = ?, email = ?, role_id = ?, lab_id = ?, status = ?
       WHERE user_id = ?`,
      [real_name, gender, phone, email, role_id, lab_id || null, status, id]
    );

    res.json({
      message: '修改用户成功'
    });
  } catch (error) {
    console.error('修改用户失败:', error);
    res.status(500).json({
      message: '修改用户失败',
      error: error.message
    });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM user WHERE user_id = ?`, [id]);

    res.json({
      message: '删除用户成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      message: '删除用户失败，可能存在关联数据',
      error: error.message
    });
  }
};
