const pool = require('../config/db');

// 获取危化品列表
exports.getAllChemicals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, cc.category_name
      FROM chemical c
      LEFT JOIN chemical_category cc ON c.category_id = cc.category_id
      ORDER BY c.chemical_id DESC
    `);

    res.json({
      message: '获取危化品列表成功',
      data: rows
    });
  } catch (error) {
    console.error('获取危化品失败:', error);
    res.status(500).json({
      message: '获取危化品失败',
      error: error.message
    });
  }
};

// 获取危化品分类
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM chemical_category
      ORDER BY category_id DESC
    `);

    res.json({
      message: '获取危化品分类成功',
      data: rows
    });
  } catch (error) {
    console.error('获取危化品分类失败:', error);
    res.status(500).json({
      message: '获取危化品分类失败',
      error: error.message
    });
  }
};

// 新增危化品
exports.createChemical = async (req, res) => {
  try {
    const {
      chemical_name,
      category_id,
      cas_no,
      danger_level,
      unit,
      storage_requirement,
      validity_date,
      sds_file_path,
      status,
      remark
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO chemical
      (chemical_name, category_id, cas_no, danger_level, unit, storage_requirement, validity_date, sds_file_path, status, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        chemical_name,
        category_id,
        cas_no,
        danger_level,
        unit,
        storage_requirement,
        validity_date,
        sds_file_path,
        status || '正常',
        remark
      ]
    );

    res.json({
      message: '新增危化品成功',
      chemical_id: result.insertId
    });
  } catch (error) {
    console.error('新增危化品失败:', error);
    res.status(500).json({
      message: '新增危化品失败',
      error: error.message
    });
  }
};

// 修改危化品
exports.updateChemical = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      chemical_name,
      category_id,
      cas_no,
      danger_level,
      unit,
      storage_requirement,
      validity_date,
      sds_file_path,
      status,
      remark
    } = req.body;

    await pool.query(
      `UPDATE chemical
       SET chemical_name = ?, category_id = ?, cas_no = ?, danger_level = ?, unit = ?, storage_requirement = ?, validity_date = ?, sds_file_path = ?, status = ?, remark = ?
       WHERE chemical_id = ?`,
      [
        chemical_name,
        category_id,
        cas_no,
        danger_level,
        unit,
        storage_requirement,
        validity_date,
        sds_file_path,
        status,
        remark,
        id
      ]
    );

    res.json({
      message: '修改危化品成功'
    });
  } catch (error) {
    console.error('修改危化品失败:', error);
    res.status(500).json({
      message: '修改危化品失败',
      error: error.message
    });
  }
};

// 删除危化品
exports.deleteChemical = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM chemical WHERE chemical_id = ?`, [id]);

    res.json({
      message: '删除危化品成功'
    });
  } catch (error) {
    console.error('删除危化品失败:', error);
    res.status(500).json({
      message: '删除危化品失败，可能存在关联数据',
      error: error.message
    });
  }
};