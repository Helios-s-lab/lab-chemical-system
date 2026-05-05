const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.user_id, u.username, u.real_name, u.gender, u.phone, u.email,
             u.status, u.create_time, r.role_name, l.lab_name
      FROM sys_user u
      LEFT JOIN role r ON u.role_id = r.role_id
      LEFT JOIN laboratory l ON u.lab_id = l.lab_id
      ORDER BY u.user_id DESC
    `);
    res.json({ message: '获取用户列表成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, password, real_name, gender, phone, email, role_id, lab_id, status } = req.body;

    const result = await pool.query(
      `INSERT INTO sys_user (username, password, real_name, gender, phone, email, role_id, lab_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING user_id`,
      [username, password, real_name, gender, phone, email, role_id, lab_id || null, status || '正常']
    );

    res.json({ message: '新增用户成功', user_id: result.rows[0].user_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '新增用户失败', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { real_name, gender, phone, email, role_id, lab_id, status } = req.body;

    await pool.query(
      `UPDATE sys_user
       SET real_name=$1, gender=$2, phone=$3, email=$4, role_id=$5, lab_id=$6, status=$7
       WHERE user_id=$8`,
      [real_name, gender, phone, email, role_id, lab_id || null, status, id]
    );

    res.json({ message: '修改用户成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '修改用户失败', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM sys_user WHERE user_id=$1`, [id]);
    res.json({ message: '删除用户成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '删除用户失败，可能存在关联数据', error: error.message });
  }
};