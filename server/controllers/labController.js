const pool = require('../config/db');

// 获取实验室列表
exports.getAllLabs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM laboratory
      ORDER BY lab_id DESC
    `);

    res.json({
      message: '获取实验室列表成功',
      data: rows
    });
  } catch (error) {
    console.error('获取实验室失败:', error);
    res.status(500).json({
      message: '获取实验室失败',
      error: error.message
    });
  }
};

// 新增实验室
exports.createLab = async (req, res) => {
  try {
    const { lab_name, location, safety_level, status, remark } = req.body;

    const [result] = await pool.query(
      `INSERT INTO laboratory (lab_name, location, safety_level, status, remark)
       VALUES (?, ?, ?, ?, ?)`,
      [lab_name, location, safety_level, status || '正常', remark]
    );

    res.json({
      message: '新增实验室成功',
      lab_id: result.insertId
    });
  } catch (error) {
    console.error('新增实验室失败:', error);
    res.status(500).json({
      message: '新增实验室失败',
      error: error.message
    });
  }
};

// 修改实验室
exports.updateLab = async (req, res) => {
  try {
    const { id } = req.params;
    const { lab_name, location, safety_level, status, remark } = req.body;

    await pool.query(
      `UPDATE laboratory
       SET lab_name = ?, location = ?, safety_level = ?, status = ?, remark = ?
       WHERE lab_id = ?`,
      [lab_name, location, safety_level, status, remark, id]
    );

    res.json({
      message: '修改实验室成功'
    });
  } catch (error) {
    console.error('修改实验室失败:', error);
    res.status(500).json({
      message: '修改实验室失败',
      error: error.message
    });
  }
};

// 删除实验室
exports.deleteLab = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM laboratory WHERE lab_id = ?`, [id]);

    res.json({
      message: '删除实验室成功'
    });
  } catch (error) {
    console.error('删除实验室失败:', error);
    res.status(500).json({
      message: '删除实验室失败，可能存在关联数据',
      error: error.message
    });
  }
};
