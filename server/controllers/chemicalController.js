const pool = require('../config/db');

exports.getAllChemicals = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, cc.category_name
      FROM chemical c
      LEFT JOIN chemical_category cc ON c.category_id = cc.category_id
      ORDER BY c.chemical_id DESC
    `);
    res.json({ message: '获取危化品列表成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取危化品失败', error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM chemical_category ORDER BY category_id DESC`);
    res.json({ message: '获取危化品分类成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取危化品分类失败', error: error.message });
  }
};

exports.createChemical = async (req, res) => {
  try {
    const { chemical_name, category_id, cas_no, danger_level, unit, storage_requirement, validity_date, sds_file_path, status, remark } = req.body;
    const result = await pool.query(
      `INSERT INTO chemical (chemical_name, category_id, cas_no, danger_level, unit, storage_requirement, validity_date, sds_file_path, status, remark)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING chemical_id`,
      [chemical_name, category_id, cas_no, danger_level, unit, storage_requirement, validity_date, sds_file_path, status || '正常', remark]
    );
    res.json({ message: '新增危化品成功', chemical_id: result.rows[0].chemical_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '新增危化品失败', error: error.message });
  }
};

exports.updateChemical = async (req, res) => {
  try {
    const { id } = req.params;
    const { chemical_name, category_id, cas_no, danger_level, unit, storage_requirement, validity_date, sds_file_path, status, remark } = req.body;
    await pool.query(
      `UPDATE chemical SET chemical_name=$1, category_id=$2, cas_no=$3, danger_level=$4, unit=$5, storage_requirement=$6, validity_date=$7, sds_file_path=$8, status=$9, remark=$10
       WHERE chemical_id=$11`,
      [chemical_name, category_id, cas_no, danger_level, unit, storage_requirement, validity_date, sds_file_path, status, remark, id]
    );
    res.json({ message: '修改危化品成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '修改危化品失败', error: error.message });
  }
};

exports.deleteChemical = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM chemical WHERE chemical_id=$1`, [id]);
    res.json({ message: '删除危化品成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '删除危化品失败', error: error.message });
  }
};